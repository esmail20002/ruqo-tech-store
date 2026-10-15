begin;

create table public.product_specifications (
  product_slug text not null references public.products(slug) on update cascade on delete cascade,
  language_code text not null check (language_code in ('en', 'fr', 'es', 'zh', 'ar')),
  position smallint not null check (position >= 0),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  description text not null check (char_length(btrim(description)) between 1 and 500),
  primary key (product_slug, language_code, position)
);

insert into public.product_specifications (product_slug, language_code, position, title, description)
select
  feature.product_slug,
  feature.language_code,
  feature.position,
  case feature.language_code
    when 'en' then case product.category_slug
      when 'phones' then (array['Camera / platform', 'Storage / display', 'Core technology', 'Design / experience'])[feature.position + 1]
      when 'laptops' then (array['Display', 'Processor', 'Memory / design', 'Power / connectivity'])[feature.position + 1]
      when 'audio' then (array['Sound', 'Noise control', 'Connectivity', 'Comfort'])[feature.position + 1]
      when 'wearables' then (array['Health', 'Tracking', 'Connectivity', 'Design'])[feature.position + 1]
    end
    when 'ar' then case product.category_slug
      when 'phones' then (array['الكاميرا / المنصة', 'التخزين / الشاشة', 'التقنية الأساسية', 'التصميم / التجربة'])[feature.position + 1]
      when 'laptops' then (array['الشاشة', 'المعالج', 'الذاكرة / التصميم', 'الطاقة / الاتصال'])[feature.position + 1]
      when 'audio' then (array['الصوت', 'عزل الضجيج', 'الاتصال', 'الراحة'])[feature.position + 1]
      when 'wearables' then (array['الصحة', 'المتابعة', 'الاتصال', 'التصميم'])[feature.position + 1]
    end
    when 'fr' then case product.category_slug
      when 'phones' then (array['Appareil photo / plateforme', 'Stockage / écran', 'Technologie principale', 'Design / expérience'])[feature.position + 1]
      when 'laptops' then (array['Écran', 'Processeur', 'Mémoire / design', 'Alimentation / connectivité'])[feature.position + 1]
      when 'audio' then (array['Son', 'Réduction du bruit', 'Connectivité', 'Confort'])[feature.position + 1]
      when 'wearables' then (array['Santé', 'Suivi', 'Connectivité', 'Design'])[feature.position + 1]
    end
    when 'es' then case product.category_slug
      when 'phones' then (array['Cámara / plataforma', 'Almacenamiento / pantalla', 'Tecnología principal', 'Diseño / experiencia'])[feature.position + 1]
      when 'laptops' then (array['Pantalla', 'Procesador', 'Memoria / diseño', 'Potencia / conectividad'])[feature.position + 1]
      when 'audio' then (array['Sonido', 'Control de ruido', 'Conectividad', 'Comodidad'])[feature.position + 1]
      when 'wearables' then (array['Salud', 'Seguimiento', 'Conectividad', 'Diseño'])[feature.position + 1]
    end
    when 'zh' then case product.category_slug
      when 'phones' then (array['相机 / 平台', '存储 / 屏幕', '核心技术', '设计 / 体验'])[feature.position + 1]
      when 'laptops' then (array['显示屏', '处理器', '内存 / 设计', '电源 / 连接'])[feature.position + 1]
      when 'audio' then (array['音质', '降噪', '连接方式', '佩戴舒适度'])[feature.position + 1]
      when 'wearables' then (array['健康', '追踪', '连接方式', '设计'])[feature.position + 1]
    end
  end,
  feature.content
from public.product_features feature
join public.products product on product.slug = feature.product_slug
where feature.position < 4;

alter table public.product_specifications enable row level security;

create policy product_specifications_read_active_products on public.product_specifications
  for select to anon, authenticated
  using (exists (
    select 1 from public.products p
    where p.slug = product_slug and p.is_active
  ));

create policy product_specifications_manage_catalog on public.product_specifications
  for all to authenticated
  using (public.has_store_role(array['owner', 'admin', 'catalog_manager']::public.store_role[]))
  with check (public.has_store_role(array['owner', 'admin', 'catalog_manager']::public.store_role[]));

grant select on public.product_specifications to anon, authenticated;
grant insert, update, delete on public.product_specifications to authenticated;

commit;