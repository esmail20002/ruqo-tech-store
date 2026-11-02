begin;

create table public.product_review_votes (
  product_review_id uuid not null references public.product_reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote_value smallint not null check (vote_value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (product_review_id, user_id)
);

create index product_review_votes_user_id_idx
  on public.product_review_votes (user_id);

alter table public.product_review_votes enable row level security;

revoke all on public.product_review_votes from anon, authenticated;
grant select, insert, update, delete on public.product_review_votes to authenticated;

create policy product_review_votes_read_own
  on public.product_review_votes for select to authenticated
  using (user_id = (select auth.uid()));

create policy product_review_votes_insert_own
  on public.product_review_votes for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.product_reviews review
      join public.products product on product.slug = review.product_slug
      where review.id = product_review_id
        and review.is_visible
        and product.is_active
    )
  );

create policy product_review_votes_update_own
  on public.product_review_votes for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.product_reviews review
      join public.products product on product.slug = review.product_slug
      where review.id = product_review_id
        and review.is_visible
        and product.is_active
    )
  );

create policy product_review_votes_delete_own
  on public.product_review_votes for delete to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.get_product_review_vote_summaries(p_review_ids uuid[])
returns table (
  review_id uuid,
  like_count bigint,
  dislike_count bigint,
  user_vote smallint
)
language sql
stable
security definer
set search_path = ''
as $function$
  select
    review.id,
    count(vote.user_id) filter (where vote.vote_value = 1),
    count(vote.user_id) filter (where vote.vote_value = -1),
    max(vote.vote_value) filter (where vote.user_id = (select auth.uid()))
  from public.product_reviews review
  join public.products product on product.slug = review.product_slug
  left join public.product_review_votes vote on vote.product_review_id = review.id
  where review.id = any(coalesce(p_review_ids, array[]::uuid[]))
    and review.is_visible
    and product.is_active
  group by review.id;
$function$;

revoke all on function public.get_product_review_vote_summaries(uuid[]) from public;
grant execute on function public.get_product_review_vote_summaries(uuid[]) to anon, authenticated;

commit;
