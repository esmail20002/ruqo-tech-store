insert into public.categories (slug, name_translations, description_translations, sort_order, is_active)
values
  ('phones', '{"en":"Phones","fr":"Téléphones","es":"Móviles","zh":"手机","ar":"الهواتف"}'::jsonb, '{"en":"Smartphones and mobile devices","fr":"Smartphones et appareils mobiles","es":"Móviles y dispositivos portátiles","zh":"智能手机与移动设备","ar":"الهواتف والأجهزة المحمولة"}'::jsonb, 1, true),
  ('laptops', '{"en":"Laptops","fr":"Ordinateurs portables","es":"Portátiles","zh":"笔记本电脑","ar":"اللابتوبات"}'::jsonb, '{"en":"Laptops and productivity devices","fr":"Ordinateurs portables et productivité","es":"Portátiles y productividad","zh":"笔记本电脑与生产力设备","ar":"اللابتوبات وأجهزة الإنتاجية"}'::jsonb, 2, true),
  ('audio', '{"en":"Audio","fr":"Audio","es":"Audio","zh":"音频","ar":"الصوتيات"}'::jsonb, '{"en":"Headphones and audio equipment","fr":"Casques et équipements audio","es":"Auriculares y equipos de audio","zh":"耳机与音频设备","ar":"سماعات وأجهزة صوتية"}'::jsonb, 3, true),
  ('wearables', '{"en":"Wearables","fr":"Objets connectés","es":"Dispositivos vestibles","zh":"可穿戴设备","ar":"الأجهزة القابلة للارتداء"}'::jsonb, '{"en":"Smart watches and wearable technology","fr":"Montres connectées et technologie portable","es":"Relojes inteligentes y tecnología vestible","zh":"智能手表与可穿戴科技","ar":"الساعات الذكية والتقنيات القابلة للارتداء"}'::jsonb, 4, true)
on conflict (slug) do update set
  name_translations = excluded.name_translations,
  description_translations = excluded.description_translations,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.store_settings (setting_key, setting_value, description, is_public)
values (
  'storefront',
  '{"default_language":"en","supported_languages":["en","fr","es","zh","ar"],"default_currency":"USD","supported_currencies":["USD","SAR","EUR"],"free_shipping_threshold":299,"standard_shipping_fee":25,"return_window_days":7,"default_payment_method":"cash_on_delivery"}'::jsonb,
  'Public storefront defaults and supported options',
  true
)
on conflict (setting_key) do update set
  setting_value = excluded.setting_value,
  description = excluded.description,
  is_public = excluded.is_public;
