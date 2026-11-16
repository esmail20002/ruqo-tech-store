begin;

create table public.invoice_verifications (
  order_id uuid primary key references public.orders(id) on delete cascade,
  token text not null unique default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
    check (token ~ '^[0-9a-f]{64}$'),
  revoked_at timestamptz
);

alter table public.invoice_verifications enable row level security;
revoke all on public.invoice_verifications from public, anon, authenticated;
grant select, update (revoked_at) on public.invoice_verifications to authenticated;
grant all on public.invoice_verifications to service_role;

create policy invoice_verifications_read_order on public.invoice_verifications
  for select to authenticated using (
    exists (
      select 1 from public.orders o where o.id = order_id
        and (o.user_id = (select auth.uid())
          or public.has_store_role(array['owner', 'admin', 'order_manager']::public.store_role[]))
    )
  );
create policy invoice_verifications_revoke_staff on public.invoice_verifications
  for update to authenticated
  using (public.has_store_role(array['owner', 'admin', 'order_manager']::public.store_role[]))
  with check (public.has_store_role(array['owner', 'admin', 'order_manager']::public.store_role[]));

create function public.create_invoice_verification()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.invoice_verifications (order_id) values (new.id);
  return new;
end;
$$;
revoke all on function public.create_invoice_verification() from public, anon, authenticated;

create trigger orders_create_invoice_verification
  after insert on public.orders for each row execute function public.create_invoice_verification();

insert into public.invoice_verifications (order_id) select id from public.orders;

create function public.get_invoice_verification_token(p_order_number text)
returns text language sql security invoker set search_path = ''
as $$
  select v.token from public.invoice_verifications v
  join public.orders o on o.id = v.order_id
  where o.order_number = p_order_number and v.revoked_at is null;
$$;
revoke all on function public.get_invoice_verification_token(text) from public, anon, authenticated;
grant execute on function public.get_invoice_verification_token(text) to authenticated, service_role;

create function public.verify_invoice(p_token text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid verification token.' using errcode = '22023';
  end if;
  select jsonb_build_object(
    'invoice_number', 'INV-' || o.order_number,
    'issued_at', o.created_at,
    'status', o.status
  ) into v_result
  from public.invoice_verifications v
  join public.orders o on o.id = v.order_id
  where v.token = p_token and v.revoked_at is null;
  return v_result;
end;
$$;
revoke all on function public.verify_invoice(text) from public, anon, authenticated;
grant execute on function public.verify_invoice(text) to anon, authenticated, service_role;

commit;
