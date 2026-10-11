const copy = {
  en: {
    shipping: "Free delivery over 299 SAR",
    warranty: "2-year warranty + 7-day returns",
    payment: "Secure payments",
    new: "New",
    categories: "Categories",
    deals: "Deals",
    reviews: "Reviews",
    support: "Support",
    account: "Account",
    cart: "Cart",
    cartLabel: "Cart, 2 items",
    home: "Home",
    allProducts: "All products",
    eyebrow: "The RUQO TECH collection",
    title: "Find your next favorite.",
    intro: "Considered technology, chosen for the way you live and work.",
    delivery: "Fast delivery",
    warrantyShort: "2-year warranty",
    returns: "Easy returns",
    filters: "Filters",
    sortBy: "Sort by",
    sortFeatured: "Featured",
    sortNewest: "Newest",
    sortPriceAsc: "Price: low to high",
    sortPriceDesc: "Price: high to low",
    sortRating: "Top rated",
    refine: "Refine your search",
    category: "Category",
    phones: "Phones",
    laptops: "Laptops",
    audio: "Audio",
    wearables: "Wearables",
    priceRange: "Price range",
    min: "Min",
    max: "Max",
    rating: "Customer rating",
    anyRating: "Any rating",
    andUp: "& up",
    inStock: "In stock only",
    clearFilters: "Clear all filters",
    productsFound: "products",
    curated: "Curated for you",
    noResults: "No products found",
    tryAgain: "Try changing your search or filters.",
    add: "Add to cart",
    unavailable: "Out of stock",
    added: "Added to your bag",
    saved: "Saved to wishlist",
    removed: "Removed from wishlist",
    searchPlaceholder: "Search products or brands",
    filterLabel: "Filters",
    sortLabel: "Sort products",
    gridLabel: "Grid view",
    listLabel: "List view",
    badgeNew: "Just arrived",
    badgeSale: "Special price",
    badgePopular: "Popular choice",
    greatValue: "Great value",
    rights: "© 2026 RUQO TECH. All rights reserved.",
  },
  ar: {
    shipping: "توصيل مجاني فوق 299 ر.س",
    warranty: "ضمان سنتين + استرجاع خلال 7 أيام",
    payment: "مدفوعات آمنة",
    new: "جديد",
    categories: "التصنيفات",
    deals: "العروض",
    reviews: "التقييمات",
    support: "الدعم",
    account: "حسابي",
    cart: "السلة",
    cartLabel: "السلة، عنصران",
    home: "الرئيسية",
    allProducts: "كل المنتجات",
    eyebrow: "مجموعة RUQO TECH",
    title: "اعثر على جهازك القادم.",
    intro: "تقنيات مختارة بعناية لتناسب أسلوب حياتك وعملك.",
    delivery: "توصيل سريع",
    warrantyShort: "ضمان سنتين",
    returns: "استرجاع سهل",
    filters: "الفلاتر",
    sortBy: "الترتيب",
    sortFeatured: "الأبرز",
    sortNewest: "الأحدث",
    sortPriceAsc: "السعر: من الأقل",
    sortPriceDesc: "السعر: من الأعلى",
    sortRating: "الأعلى تقييمًا",
    refine: "خصص نتائجك",
    category: "الفئة",
    phones: "الهواتف",
    laptops: "اللابتوبات",
    audio: "الصوتيات",
    wearables: "الأجهزة القابلة للارتداء",
    priceRange: "نطاق السعر",
    min: "من",
    max: "إلى",
    rating: "تقييم العملاء",
    anyRating: "كل التقييمات",
    andUp: "فأعلى",
    inStock: "المتوفر فقط",
    clearFilters: "مسح الفلاتر",
    productsFound: "منتجات",
    curated: "مختارة لك",
    noResults: "لا توجد منتجات مطابقة",
    tryAgain: "جرّب تغيير البحث أو الفلاتر.",
    add: "أضف إلى السلة",
    unavailable: "نفد المخزون",
    added: "أضيف إلى سلتك",
    saved: "أضيف للمفضلة",
    removed: "أزيل من المفضلة",
    searchPlaceholder: "ابحث عن منتج أو علامة تجارية",
    filterLabel: "الفلاتر",
    sortLabel: "ترتيب المنتجات",
    gridLabel: "عرض شبكي",
    listLabel: "عرض قائمة",
    badgeNew: "وصل حديثًا",
    badgeSale: "سعر خاص",
    badgePopular: "اختيار شائع",
    greatValue: "قيمة ممتازة",
    rights: "© 2026 RUQO TECH. جميع الحقوق محفوظة.",
  },
};

const legacyProducts = [
  {
    id: "macbook-pro",
    brand: "Apple",
    name: "MacBook Pro 14 M4",
    category: "laptops",
    description: {
      en: "Liquid Retina XDR · 16GB unified memory",
      ar: "شاشة Liquid Retina XDR · ذاكرة 16GB",
    },
    price: 8499,
    oldPrice: 9299,
    rating: 4.9,
    reviews: 248,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=85",
    badge: "popular",
    stock: true,
    newest: 12,
  },
  {
    id: "galaxy-s25",
    brand: "Samsung",
    name: "Galaxy S25 Ultra",
    category: "phones",
    description: {
      en: "200MP camera · 512GB storage",
      ar: "كاميرا 200MP · سعة تخزين 512GB",
    },
    price: 5499,
    oldPrice: 5999,
    rating: 4.8,
    reviews: 186,
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=85",
    badge: "sale",
    stock: true,
    newest: 11,
  },
  {
    id: "airpods-pro",
    brand: "Apple",
    name: "AirPods Pro 2",
    category: "audio",
    description: {
      en: "Active noise cancellation · USB-C",
      ar: "إلغاء ضجيج نشط · منفذ USB-C",
    },
    price: 1399,
    oldPrice: 1599,
    rating: 4.9,
    reviews: 324,
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=85",
    badge: "sale",
    stock: true,
    newest: 10,
  },
  {
    id: "galaxy-watch",
    brand: "Samsung",
    name: "Galaxy Watch 7",
    category: "wearables",
    description: {
      en: "Advanced health tracking · GPS",
      ar: "متابعة صحية متقدمة · GPS",
    },
    price: 1199,
    oldPrice: 1399,
    rating: 4.7,
    reviews: 94,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85",
    badge: "new",
    stock: true,
    newest: 9,
  },
  {
    id: "asus-zenbook",
    brand: "ASUS",
    name: "Zenbook 14 OLED",
    category: "laptops",
    description: {
      en: "3K OLED display · Intel Core Ultra 7",
      ar: "شاشة 3K OLED · معالج Intel Core Ultra 7",
    },
    price: 6299,
    oldPrice: null,
    rating: 4.8,
    reviews: 72,
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=85",
    badge: "new",
    stock: true,
    newest: 8,
  },
  {
    id: "iphone-16",
    brand: "Apple",
    name: "iPhone 16 Pro",
    category: "phones",
    description: {
      en: "A18 Pro chip · 256GB storage",
      ar: "شريحة A18 Pro · سعة تخزين 256GB",
    },
    price: 4899,
    oldPrice: 5199,
    rating: 4.9,
    reviews: 211,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=85",
    badge: "popular",
    stock: true,
    newest: 7,
  },
  {
    id: "sony-headphones",
    brand: "Sony",
    name: "WH-1000XM5",
    category: "audio",
    description: {
      en: "Studio-grade noise cancelling · 30h battery",
      ar: "عزل ضجيج احترافي · بطارية 30 ساعة",
    },
    price: 1499,
    oldPrice: 1799,
    rating: 4.8,
    reviews: 153,
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=85",
    badge: "sale",
    stock: true,
    newest: 6,
  },
  {
    id: "apple-watch",
    brand: "Apple",
    name: "Apple Watch Series 10",
    category: "wearables",
    description: {
      en: "Always-On Retina · health sensors",
      ar: "شاشة Retina دائمة · مستشعرات صحية",
    },
    price: 1899,
    oldPrice: null,
    rating: 4.8,
    reviews: 88,
    image:
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=85",
    badge: "new",
    stock: true,
    newest: 5,
  },
  {
    id: "ipad-air",
    brand: "Apple",
    name: "iPad Air 11 M3",
    category: "phones",
    description: {
      en: "M3 chip · 11-inch Liquid Retina",
      ar: "شريحة M3 · شاشة Liquid Retina مقاس 11 بوصة",
    },
    price: 2799,
    oldPrice: 2999,
    rating: 4.7,
    reviews: 61,
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=85",
    badge: "popular",
    stock: true,
    newest: 4,
  },
  {
    id: "bose-quietcomfort",
    brand: "Bose",
    name: "QuietComfort Ultra",
    category: "audio",
    description: {
      en: "Spatial audio · premium comfort",
      ar: "صوت مكاني · راحة فائقة",
    },
    price: 1699,
    oldPrice: null,
    rating: 4.6,
    reviews: 45,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85",
    badge: "popular",
    stock: false,
    newest: 3,
  },
  {
    id: "dell-xps",
    brand: "Dell",
    name: "XPS 13 Plus",
    category: "laptops",
    description: {
      en: "InfinityEdge display · Intel Core Ultra 5",
      ar: "شاشة InfinityEdge · معالج Intel Core Ultra 5",
    },
    price: 7199,
    oldPrice: 7699,
    rating: 4.7,
    reviews: 56,
    image:
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=85",
    badge: "sale",
    stock: true,
    newest: 2,
  },
  {
    id: "pixel-9",
    brand: "Google",
    name: "Pixel 9 Pro",
    category: "phones",
    description: {
      en: "Google AI · pro-level camera system",
      ar: "ذكاء Google · نظام كاميرا احترافي",
    },
    price: 3999,
    oldPrice: null,
    rating: 4.6,
    reviews: 39,
    image:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=85",
    badge: "new",
    stock: false,
    newest: 1,
  },
  {
    id: "fitbit-sense",
    brand: "Fitbit",
    name: "Sense 2",
    category: "wearables",
    description: {
      en: "Stress management · 6-day battery",
      ar: "إدارة التوتر · بطارية تدوم 6 أيام",
    },
    price: 899,
    oldPrice: 999,
    rating: 4.5,
    reviews: 67,
    image:
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=85",
    badge: "sale",
    stock: true,
    newest: 0,
  },
];
const products = window.NoursData?.products || legacyProducts;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const ui = {
  search: $("[data-catalog-search]"),
  grid: $("[data-product-grid]"),
  count: $("[data-result-count]"),
  empty: $("[data-empty-results]"),
  chips: $("[data-active-filters]"),
  min: $("[data-price-min]"),
  max: $("[data-price-max]"),
  range: $("[data-price-range]"),
  sort: $("[data-sort-select]"),
  stock: $("[data-stock-filter]"),
  panel: $(".filter-panel"),
  backdrop: $(".filter-backdrop"),
  filterButton: $("[data-filter-open]"),
  filterCount: $("[data-filter-count]"),
  cart: $("[data-cart-count]"),
};
let language = window.NoursStore?.getLanguage() || "en";
let cartCount = window.NoursStore?.cartCount() || 0;
const dealsOnly =
  new URLSearchParams(location.search).get("filter") === "deals";
let toastTimer;
let wishlist = new Set();
try {
  language =
    window.NoursStore?.getLanguage() ||
    (localStorage.getItem("nours-language") === "ar" ? "ar" : "en");
  cartCount = window.NoursStore?.cartCount() || 0;
  wishlist = new Set(
    window.NoursStore?.wishlist() ||
      JSON.parse(localStorage.getItem("nours-wishlist") || "[]"),
  );
} catch {}

function fmt(value) {
  return new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-US").format(
    value,
  );
}
function formatPrice(value) {
  const currency = window.NoursStore?.getCurrency() || "SAR";
  const rates = { SAR: 1, USD: 1 / 3.75, EUR: 0.245 };
  return new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "SAR" ? 0 : 2,
  }).format(value * rates[currency]);
}
function icon(name) {
  const item = document.createElement("i");
  item.dataset.lucide = name;
  item.setAttribute("aria-hidden", "true");
  return item;
}

function setLanguage(next) {
  language = next;
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.body.classList.toggle("is-english", language === "en");
  $$("[data-copy]").forEach((node) => {
    const text = copy[language][node.dataset.copy];
    if (text) node.textContent = text;
  });
  ui.search.placeholder = copy[language].searchPlaceholder;
  ui.search.setAttribute("aria-label", copy[language].searchPlaceholder);
  ui.sort.setAttribute("aria-label", copy[language].sortLabel);
  ui.filterButton.setAttribute("aria-label", copy[language].filterLabel);
  $(".cart-button").setAttribute(
    "aria-label",
    language === "ar"
      ? `السلة، ${fmt(cartCount)} منتجات`
      : `Cart, ${fmt(cartCount)} items`,
  );
  $('[data-view="grid"]').setAttribute("aria-label", copy[language].gridLabel);
  $('[data-view="list"]').setAttribute("aria-label", copy[language].listLabel);
  $("[data-language-toggle]").textContent =
    language === "ar" ? "English" : "العربية";
  $("[data-language-toggle]").setAttribute(
    "aria-label",
    language === "ar" ? "Switch to English" : "التبديل إلى العربية",
  );
  $(".main-nav").setAttribute(
    "aria-label",
    language === "ar" ? "التنقل الرئيسي" : "Main navigation",
  );
  try {
    if (window.NoursStore) window.NoursStore.setLanguage(language);
    else localStorage.setItem("nours-language", language);
  } catch {}
  render();
}

function filteredProducts() {
  const query = ui.search.value.trim().toLocaleLowerCase();
  const cats = $$("[data-category-filter]:checked").map((input) => input.value);
  const min = Number(ui.min.value) || 0;
  const max = Number(ui.max.value) || 10000;
  const rating = Number($("[data-rating-filter]:checked").value);
  const results = products.filter((product) => {
    const searchText =
      `${product.name} ${product.brand} ${product.description.en} ${product.description.ar}`.toLocaleLowerCase();
    return (
      (!query || searchText.includes(query)) &&
      (!cats.length || cats.includes(product.category)) &&
      product.price >= min &&
      product.price <= max &&
      product.rating >= rating &&
      (!dealsOnly || (product.oldPrice && product.oldPrice > product.price)) &&
      (!ui.stock.checked || product.stock)
    );
  });
  const comparators = {
    featured: (a, b) =>
      Number(b.badge === "popular") - Number(a.badge === "popular") ||
      b.rating - a.rating,
    newest: (a, b) => b.newest - a.newest,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
  };
  return results.sort(comparators[ui.sort.value] || comparators.featured);
}

function productCard(product) {
  const card = document.createElement("article");
  card.className = `catalog-product${product.stock ? "" : " is-unavailable"}`;
  const art = document.createElement("div");
  art.className = "catalog-product-art";
  const imageLink = document.createElement("a");
  imageLink.className = "catalog-image-link";
  imageLink.href = `/product.html?id=${encodeURIComponent(product.id)}`;
  imageLink.setAttribute("aria-label", product.name);
  const image = document.createElement("img");
  image.src = product.image;
  image.alt = `${product.brand} ${product.name}`;
  image.loading = "lazy";
  image.decoding = "async";
  imageLink.append(image);
  art.append(imageLink);
  const badge = document.createElement("span");
  badge.className = `catalog-badge${product.badge === "sale" ? " is-sale" : ""}`;
  badge.textContent =
    copy[language][
      product.badge === "sale"
        ? "badgeSale"
        : product.badge === "new"
          ? "badgeNew"
          : "badgePopular"
    ];
  art.append(badge);
  const wish = document.createElement("button");
  wish.type = "button";
  wish.className = `catalog-wishlist${wishlist.has(product.id) ? " is-saved" : ""}`;
  wish.setAttribute("aria-pressed", String(wishlist.has(product.id)));
  wish.setAttribute(
    "aria-label",
    wishlist.has(product.id) ? copy[language].removed : copy[language].saved,
  );
  wish.append(icon("heart"));
  wish.addEventListener("click", () => {
    if (window.NoursStore) {
      wishlist = new Set(window.NoursStore.toggleWishlist(product.id));
    } else {
      wishlist.has(product.id)
        ? wishlist.delete(product.id)
        : wishlist.add(product.id);
    }
    try {
      localStorage.setItem("nours-wishlist", JSON.stringify([...wishlist]));
    } catch {}
    render();
    toast(
      wishlist.has(product.id) ? copy[language].saved : copy[language].removed,
    );
  });
  art.append(wish);
  const info = document.createElement("div");
  info.className = "catalog-product-info";
  const brand = document.createElement("span");
  brand.className = "catalog-brand";
  brand.textContent = product.brand;
  const name = document.createElement("h3");
  const detailLink = document.createElement("a");
  detailLink.href = `/product.html?id=${encodeURIComponent(product.id)}`;
  detailLink.textContent = product.name;
  name.append(detailLink);
  const description = document.createElement("p");
  description.className = "catalog-description";
  description.textContent = product.description[language];
  const rating = document.createElement("div");
  rating.className = "catalog-rating";
  rating.append(icon("star"));
  const score = document.createElement("strong");
  score.textContent = product.rating.toFixed(1);
  const reviews = document.createElement("small");
  reviews.textContent = `(${fmt(product.reviews)})`;
  rating.append(score, reviews);
  const bottom = document.createElement("div");
  bottom.className = "catalog-product-bottom";
  const price = document.createElement("div");
  price.className = "catalog-price";
  const current = document.createElement("strong");
  current.textContent = formatPrice(product.price);
  price.append(current);
  if (product.oldPrice) {
    const old = document.createElement("del");
    old.textContent = formatPrice(product.oldPrice);
    price.append(old);
  }
  const add = document.createElement("button");
  add.type = "button";
  add.className = "catalog-add";
  add.disabled = !product.stock;
  add.setAttribute(
    "aria-label",
    product.stock
      ? `${copy[language].add}: ${product.name}`
      : copy[language].unavailable,
  );
  add.append(icon(product.stock ? "shopping-bag" : "minus"));
  add.addEventListener("click", () => {
    if (window.NoursStore) {
      window.NoursStore.addToCart(product.id);
      cartCount = window.NoursStore.cartCount();
    } else {
      cartCount += 1;
    }
    ui.cart.textContent = fmt(cartCount);
    try {
      localStorage.setItem("nours-cart-count", String(cartCount));
    } catch {}
    toast(`${product.name} · ${copy[language].added}`);
  });
  const discountPercent = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;
  if ((product.badge === "popular" || discountPercent >= 16) && product.stock) {
    const valueNote = document.createElement("span");
    valueNote.className = "product-value-note";
    valueNote.append(
      icon("sparkles"),
      document.createTextNode(copy[language].greatValue),
    );
    bottom.append(price, valueNote, add);
  } else {
    bottom.append(price, add);
  }
  info.append(brand, name, description, rating, bottom);
  card.append(art, info);
  return card;
}

function activeFilters() {
  const chips = [];
  const query = ui.search.value.trim();
  if (query)
    chips.push({ text: `“${query}”`, clear: () => (ui.search.value = "") });
  if (dealsOnly)
    chips.push({
      text: copy[language].badgeSale,
      clear: () => {
        const nextUrl = new URL(location.href);
        nextUrl.searchParams.delete("filter");
        location.href = nextUrl;
      },
    });
  $$("[data-category-filter]:checked").forEach((input) =>
    chips.push({
      text: copy[language][input.value],
      clear: () => (input.checked = false),
    }),
  );
  const min = Number(ui.min.value) || 0,
    max = Number(ui.max.value) || 10000;
  if (min > 0 || max < 10000)
    chips.push({
      text: `${fmt(min)} – ${fmt(max)} ${language === "ar" ? "ر.س" : "SAR"}`,
      clear: () => {
        ui.min.value = 0;
        ui.max.value = 10000;
        ui.range.value = 10000;
      },
    });
  const selected = $("[data-rating-filter]:checked");
  if (Number(selected.value) > 0)
    chips.push({
      text: `${selected.value}★ ${copy[language].andUp}`,
      clear: () => ($('[data-rating-filter][value="0"]').checked = true),
    });
  if (ui.stock.checked)
    chips.push({
      text: copy[language].inStock,
      clear: () => (ui.stock.checked = false),
    });
  ui.chips.replaceChildren(
    ...chips.map((chip) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-chip";
      button.append(document.createTextNode(chip.text), icon("x"));
      button.addEventListener("click", () => {
        chip.clear();
        render();
      });
      return button;
    }),
  );
  ui.filterCount.hidden = !chips.length;
  ui.filterCount.textContent = String(chips.length);
}

function render() {
  const results = filteredProducts();
  ui.grid.replaceChildren(...results.map(productCard));
  ui.count.textContent = fmt(results.length);
  ui.empty.hidden = results.length > 0;
  ui.grid.hidden = results.length === 0;
  activeFilters();
  window.lucide?.createIcons();
}

function toast(message) {
  let node = $(".catalog-toast");
  if (!node) {
    node = document.createElement("div");
    node.className = "catalog-toast";
    node.setAttribute("role", "status");
    node.append(icon("check"), document.createElement("span"));
    document.body.append(node);
  }
  node.querySelector("span").textContent = message;
  node.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("is-visible"), 2100);
}

function closeFilters(returnFocus = true) {
  ui.panel.classList.remove("is-open");
  ui.backdrop.classList.remove("is-visible");
  ui.filterButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("filters-open");
  if (returnFocus) ui.filterButton.focus();
}
function resetFilters() {
  ui.search.value = "";
  ui.min.value = 0;
  ui.max.value = 10000;
  ui.range.value = 10000;
  ui.stock.checked = false;
  ui.sort.value = "featured";
  $$("[data-category-filter]").forEach((input) => (input.checked = false));
  $('[data-rating-filter][value="0"]').checked = true;
  render();
}

ui.search.addEventListener("input", render);
ui.sort.addEventListener("change", render);
ui.stock.addEventListener("change", render);
$$("[data-category-filter],[data-rating-filter]").forEach((input) =>
  input.addEventListener("change", render),
);
ui.min.addEventListener("change", () => {
  ui.min.value = Math.max(
    0,
    Math.min(Number(ui.min.value) || 0, Number(ui.max.value) || 10000),
  );
  render();
});
ui.max.addEventListener("change", () => {
  ui.max.value = Math.max(
    Number(ui.min.value) || 0,
    Math.min(10000, Number(ui.max.value) || 10000),
  );
  ui.range.value = ui.max.value;
  render();
});
ui.range.addEventListener("input", () => {
  ui.max.value = ui.range.value;
  render();
});
$$("[data-reset-filters]").forEach((button) =>
  button.addEventListener("click", resetFilters),
);
ui.filterButton.addEventListener("click", () => {
  ui.panel.classList.add("is-open");
  ui.backdrop.classList.add("is-visible");
  ui.filterButton.setAttribute("aria-expanded", "true");
  document.body.classList.add("filters-open");
  $(".filter-close").focus();
});
$$("[data-filter-close]").forEach((button) =>
  button.addEventListener("click", () => closeFilters()),
);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && ui.panel.classList.contains("is-open"))
    closeFilters();
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    ui.search.focus();
  }
});
$$("[data-view]").forEach((button) =>
  button.addEventListener("click", () => {
    const list = button.dataset.view === "list";
    ui.grid.classList.toggle("is-list", list);
    $$("[data-view]").forEach((option) => {
      const active = option === button;
      option.classList.toggle("is-active", active);
      option.setAttribute("aria-pressed", String(active));
    });
  }),
);
$("[data-search-focus]").addEventListener("click", () => {
  ui.search.focus();
  $("#catalog").scrollIntoView({ behavior: "smooth" });
});
$("[data-language-toggle]").addEventListener("click", () =>
  setLanguage(language === "en" ? "ar" : "en"),
);
$(".menu-toggle").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const open = button.getAttribute("aria-expanded") !== "true";
  button.setAttribute("aria-expanded", String(open));
  button.classList.toggle("is-open", open);
  $(".main-nav").classList.toggle("open", open);
});
$$(".main-nav a").forEach((link) =>
  link.addEventListener("click", () => {
    $(".main-nav").classList.remove("open");
    const button = $(".menu-toggle");
    button.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
  }),
);
ui.cart.textContent = fmt(cartCount);
const pageParams = new URLSearchParams(location.search);
const requestedCategory = pageParams.get("category");
if (
  requestedCategory &&
  ["phones", "laptops", "audio", "wearables"].includes(requestedCategory)
) {
  const categoryInput = $(
    `[data-category-filter][value="${requestedCategory}"]`,
  );
  if (categoryInput) categoryInput.checked = true;
}
if (
  ["featured", "newest", "price-asc", "price-desc", "rating"].includes(
    pageParams.get("sort"),
  )
) {
  ui.sort.value = pageParams.get("sort");
}
setLanguage(language);
