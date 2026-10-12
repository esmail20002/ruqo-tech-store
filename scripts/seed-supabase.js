const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sourcePath = path.resolve(__dirname, "../public/js/catalog-data.js");
const outputPath = path.resolve(__dirname, "../supabase/seeds/catalog.sql");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(sourcePath, "utf8"), context, {
  filename: "catalog-data.js",
});

const { products, localizeProduct } = context.window.NoursData;
const languages = ["en", "fr", "es", "zh", "ar"];
const optionTranslations = {
  Black: { fr: "Noir", es: "Negro", zh: "黑色", ar: "أسود" },
  Silver: { fr: "Argent", es: "Plateado", zh: "银色", ar: "فضي" },
  White: { fr: "Blanc", es: "Blanco", zh: "白色", ar: "أبيض" },
  Small: { fr: "Petit", es: "Pequeno", zh: "小号", ar: "صغير" },
  Large: { fr: "Grand", es: "Grande", zh: "大号", ar: "كبير" },
};

const quote = (value) => `'${String(value).replace(/'/g, "''")}'`;
const jsonb = (value) => `${quote(JSON.stringify(value))}::jsonb`;
const sqlValue = (value) => {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "object") return jsonb(value);
  return quote(value);
};
const rowsSql = (rows) => rows.map((row) => `(${row.map(sqlValue).join(", ")})`).join(",\n");

function getVariants(product) {
  if (product.category === "phones") {
    const values = product.id === "ipad-air" ? ["128GB", "256GB", "512GB"] : ["256GB", "512GB", "1TB"];
    const baseIndex = product.id === "galaxy-s25" ? 1 : 0;
    return values.map((value, index) => ({
      group: "storage",
      value,
      adjustment: (index - baseIndex) * 500,
    }));
  }
  if (product.category === "laptops") {
    return ["512GB", "1TB", "2TB"].map((value, index) => ({
      group: "storage",
      value,
      adjustment: index * 700,
    }));
  }
  if (product.category === "wearables") {
    const values = product.id === "apple-watch"
      ? ["42mm", "46mm"]
      : product.id === "fitbit-sense"
        ? ["Small", "Large"]
        : ["40mm", "44mm"];
    return values.map((value, index) => ({
      group: "size",
      value,
      adjustment: product.id === "fitbit-sense" ? 0 : index * 100,
    }));
  }
  return ["Black", "Silver", "White"].map((value) => ({
    group: "color",
    value,
    adjustment: 0,
  }));
}

function insert(table, columns, rows, conflict, updates) {
  if (!rows.length) return "";
  return `insert into public.${table} (${columns.join(", ")})\nvalues\n${rowsSql(rows)}\non conflict (${conflict}) do update set\n  ${updates.join(",\n  ")};`;
}

const productRows = products.map((product, index) => {
  const names = Object.fromEntries(languages.map((language) => [language, product.name]));
  const descriptions = Object.fromEntries(
    languages.map((language) => [language, localizeProduct(product, language).description[language]]),
  );
  return [
    product.id,
    product.category,
    product.brand,
    names,
    descriptions,
    product.price,
    product.oldPrice,
    "SAR",
    product.rating,
    product.reviews,
    product.badge,
    product.stock,
    true,
    product.badge === "popular",
    products.length - index,
    product.image,
  ];
});

const featureRows = products.flatMap((product) =>
  languages.flatMap((language) =>
    localizeProduct(product, language).features[language].map((content, position) => [
      product.id,
      language,
      position,
      content,
    ]),
  ),
);

const variantRows = products.flatMap((product) =>
  getVariants(product).map((variant, sortOrder) => [
    `${product.id}:${variant.group}:${variant.value}`,
    product.id,
    variant.group,
    variant.value,
    Object.fromEntries(
      languages.map((language) => [
        language,
        language === "en" ? variant.value : optionTranslations[variant.value]?.[language] || variant.value,
      ]),
    ),
    null,
    variant.adjustment,
    null,
    true,
    sortOrder,
  ]),
);

const imageRows = products.map((product) => [
  product.id,
  product.image,
  null,
  Object.fromEntries(languages.map((language) => [language, `${product.brand} ${product.name}`])),
  true,
  0,
]);

const statements = [
  insert(
    "products",
    ["slug", "category_slug", "brand", "name_translations", "description_translations", "price", "compare_at_price", "currency", "rating", "review_count", "badge", "in_stock", "is_active", "is_featured", "sort_order", "external_image_url"],
    productRows,
    "slug",
    ["category_slug = excluded.category_slug", "brand = excluded.brand", "name_translations = excluded.name_translations", "description_translations = excluded.description_translations", "price = excluded.price", "compare_at_price = excluded.compare_at_price", "currency = excluded.currency", "rating = excluded.rating", "review_count = excluded.review_count", "badge = excluded.badge", "in_stock = excluded.in_stock", "is_active = excluded.is_active", "is_featured = excluded.is_featured", "sort_order = excluded.sort_order", "external_image_url = excluded.external_image_url"],
  ),
  insert(
    "product_features",
    ["product_slug", "language_code", "position", "content"],
    featureRows,
    "product_slug, language_code, position",
    ["content = excluded.content"],
  ),
  insert(
    "product_variants",
    ["variant_key", "product_slug", "option_group", "option_value", "option_label_translations", "sku", "price_adjustment", "stock_quantity", "is_active", "sort_order"],
    variantRows,
    "variant_key",
    ["product_slug = excluded.product_slug", "option_group = excluded.option_group", "option_value = excluded.option_value", "option_label_translations = excluded.option_label_translations", "price_adjustment = excluded.price_adjustment", "is_active = excluded.is_active", "sort_order = excluded.sort_order"],
  ),
  insert(
    "product_images",
    ["product_slug", "image_url", "storage_path", "alt_translations", "is_primary", "sort_order"],
    imageRows,
    "product_slug, sort_order",
    ["image_url = excluded.image_url", "storage_path = excluded.storage_path", "alt_translations = excluded.alt_translations", "is_primary = excluded.is_primary"],
  ),
].filter(Boolean);

const sql = [
  "-- Generated from public/js/catalog-data.js by scripts/seed-supabase.js.",
  "-- Idempotent seed for the current RUQO TECH catalog; safe to re-run after reviewing changes.",
  "begin;",
  ...statements,
  "commit;",
  "",
].join("\n\n");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, sql, "utf8");
console.log(`Generated ${path.relative(process.cwd(), outputPath)} for ${products.length} products, ${featureRows.length} localized features, and ${variantRows.length} variants.`);
