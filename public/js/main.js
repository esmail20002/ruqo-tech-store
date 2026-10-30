const mainScriptUrl = document.currentScript?.src || document.baseURI;
const defaultLightLogoUrl = new URL("../images/new/li.png", mainScriptUrl).href;
window.NoursHomeI18nReady?.();

const translations = window.NoursHomeTranslations || {};
if (!window.NoursHomeTranslations) {
  console.warn('Homepage translations could not load; retaining built-in page text.');
}

const languageSelect = document.querySelector("[data-language-select]");
let currentLang = window.NoursStore?.getLanguage() || "en";
const localeByLanguage = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  zh: "zh-CN",
  ar: "ar-SA",
};
const mobileAdSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=80",
    href: "#deals",
    ar: {
      label: "عرض محدود",
      copy: "خصومات تصل إلى 35% على أجهزة مختارة",
      action: "تسوق ←",
    },
    en: {
      label: "Limited offer",
      copy: "Up to 35% off selected devices",
      action: "Shop now →",
    },
    fr: { label: "Offre limitée", copy: "Jusqu’à 35 % de remise sur une sélection", action: "Acheter →" },
    es: { label: "Oferta limitada", copy: "Hasta un 35 % de descuento en productos seleccionados", action: "Comprar →" },
    zh: { label: "限时优惠", copy: "精选设备最高优惠 35%", action: "立即选购 →" },
  },
  {
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80",
    href: "#new",
    ar: {
      label: "اختيار المحترفين",
      copy: "أجهزة لابتوب تصنع فرقًا في يومك",
      action: "اكتشفها ←",
    },
    en: {
      label: "Pro picks",
      copy: "Laptops that elevate your day",
      action: "Explore →",
    },
    fr: { label: "Sélection pro", copy: "Des ordinateurs qui font la différence", action: "Explorer →" },
    es: { label: "Selección Pro", copy: "Portátiles que mejoran tu día", action: "Explorar →" },
    zh: { label: "专业之选", copy: "让每一天更高效的笔记本电脑", action: "探索 →" },
  },
  {
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80",
    href: "#categories",
    ar: {
      label: "وصل حديثًا",
      copy: "اكتشف أحدث الهواتف الذكية",
      action: "تصفح الهواتف ←",
    },
    en: {
      label: "Just arrived",
      copy: "Discover the latest smartphones",
      action: "Shop phones →",
    },
    fr: { label: "Nouveautés", copy: "Découvrez les derniers smartphones", action: "Voir les téléphones →" },
    es: { label: "Recién llegados", copy: "Descubre los últimos smartphones", action: "Ver móviles →" },
    zh: { label: "新品上市", copy: "探索最新智能手机", action: "选购手机 →" },
  },
];
let mobileAdIndex = 0;
let mobileAdTimer;
let mobileAdTransitionTimer;
let mobileAdPaused = false;
let mobileAdHovered = false;
const mobileViewportQuery = window.matchMedia("(max-width: 640px)");
const reducedMotionQuery = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);
const categoryCarousel = setupCategoryCarousel();
const featuredProducts = [
  {
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    price: "3,299",
    ar: {
      badge: "الأكثر مبيعًا",
      brand: "Apple Watch",
      model: "Ultra 2",
      alt: "ساعة ذكية",
    },
    en: {
      badge: "Best seller",
      brand: "Apple Watch",
      model: "Ultra 2",
      alt: "Smartwatch",
    },
    fr: { badge: "Meilleure vente", brand: "Apple Watch", model: "Ultra 2", alt: "Montre connectée" },
    es: { badge: "Más vendido", brand: "Apple Watch", model: "Ultra 2", alt: "Reloj inteligente" },
    zh: { badge: "热销商品", brand: "Apple Watch", model: "Ultra 2", alt: "智能手表" },
  },
  {
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    price: "5,000",
    ar: {
      badge: "اختيار المحترفين",
      brand: "Apple MacBook",
      model: "Pro M4",
      alt: "لابتوب احترافي",
    },
    en: {
      badge: "Pro pick",
      brand: "Apple MacBook",
      model: "Pro M4",
      alt: "Professional laptop",
    },
    fr: { badge: "Choix des pros", brand: "Apple MacBook", model: "Pro M4", alt: "Ordinateur portable professionnel" },
    es: { badge: "Selección Pro", brand: "Apple MacBook", model: "Pro M4", alt: "Portátil profesional" },
    zh: { badge: "专业之选", brand: "Apple MacBook", model: "Pro M4", alt: "专业笔记本电脑" },
  },
  {
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    price: "5,499",
    ar: {
      badge: "وصل حديثًا",
      brand: "Samsung Galaxy",
      model: "S25 Ultra",
      alt: "هاتف ذكي",
    },
    en: {
      badge: "Just arrived",
      brand: "Samsung Galaxy",
      model: "S25 Ultra",
      alt: "Smartphone",
    },
    fr: { badge: "Nouveauté", brand: "Samsung Galaxy", model: "S25 Ultra", alt: "Smartphone" },
    es: { badge: "Recién llegado", brand: "Samsung Galaxy", model: "S25 Ultra", alt: "Teléfono inteligente" },
    zh: { badge: "新品上市", brand: "Samsung Galaxy", model: "S25 Ultra", alt: "智能手机" },
  },
];
let featuredProductIndex = 0;
let managedSpotlightIndex = 0;
let lastManagedSpotlightSlug = null;
let managedSpotlightTransitionInProgress = false;
let featuredProductTimer;
let featuredCountdownTimer;

function formatShowcasePrice(amount) {
  const currency = window.NoursStore?.getCurrency() || "USD";
  const rates = { SAR: 1, USD: 1 / 3.75, EUR: 0.245 };
  return new Intl.NumberFormat(localeByLanguage[currentLang] || localeByLanguage.en, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "SAR" ? 0 : 2,
  }).format(Number(amount) * rates[currency]);
}

function getHomepagePriceLabel() {
  return { ar: "السعر", en: "Price", fr: "Prix", es: "Precio", zh: "价格" }[currentLang] || "Price";
}

function renderManagedFeaturedProduct(card, isTransitionEntrance = false) {
  const spotlights = window.RUQO_HOME_SPOTLIGHTS || [];
  if (!spotlights.length) return false;
  if (managedSpotlightTransitionInProgress && !isTransitionEntrance) return true;
  managedSpotlightIndex %= spotlights.length;
  const showcase = spotlights[managedSpotlightIndex];
  const product = showcase.product || window.NoursData?.products?.find((item) => item.slug === showcase.product_slug || item.id === showcase.product_slug);
  if (!product) return false;
  const spotlightSlug = product.slug || product.id;
  const previousSpotlightSlug = lastManagedSpotlightSlug;

  const localized = window.NoursData.localizeProduct(product, currentLang);
  const copy = {
    en: { sale: "Limited offer", featured: "Featured product", begins: "Offer starts in", ends: "Offer ends in", days: "d", hours: "h", minutes: "m", seconds: "s", brand: "Brand", rating: "Customer rating", description: "Product detail", feature: "Key feature" },
    ar: { sale: "عرض لفترة محدودة", featured: "منتج مميز", begins: "يبدأ العرض خلال", ends: "ينتهي العرض خلال", days: "ي", hours: "س", minutes: "د", seconds: "ث", brand: "العلامة التجارية", rating: "تقييم العملاء", description: "تفاصيل المنتج", feature: "ميزة بارزة" },
    fr: { sale: "Offre limitée", featured: "Produit à la une", begins: "Début dans", ends: "Fin dans", days: "j", hours: "h", minutes: "m", seconds: "s", brand: "Marque", rating: "Note client", description: "Détail produit", feature: "Atout clé" },
    es: { sale: "Oferta limitada", featured: "Producto destacado", begins: "Empieza en", ends: "Termina en", days: "d", hours: "h", minutes: "m", seconds: "s", brand: "Marca", rating: "Valoración", description: "Detalle del producto", feature: "Característica" },
    zh: { sale: "限时优惠", featured: "精选商品", begins: "开始倒计时", ends: "结束倒计时", days: "天", hours: "时", minutes: "分", seconds: "秒", brand: "品牌", rating: "客户评分", description: "商品详情", feature: "核心特点" },
  }[currentLang] || { sale: "Limited offer", featured: "Featured product", begins: "Offer starts in", ends: "Offer ends in", days: "d", hours: "h", minutes: "m", seconds: "s", brand: "Brand", rating: "Customer rating", description: "Product detail", feature: "Key feature" };

  const image = card.querySelector(".featured-product-image");
  const showcasePrice = card.querySelector(".hero-showcase-price-value");
  const showcasePriceLabel = card.querySelector(".hero-showcase-price-label");
  const saleActive = Boolean(product.timedSaleActive);
  const saleConfigured = product.salePrice !== null && product.salePrice !== undefined && product.saleEndsAt;
  const regularPrice = Number(product.regularPrice ?? product.price);
  const salePrice = Number(product.salePrice);
  const discountPercent = saleActive && regularPrice > 0
    ? Math.round((1 - salePrice / regularPrice) * 100)
    : 0;
  const productBadge = card.querySelector(".product-badge");
  const topCard = document.querySelector(".floating-card.card-two");
  const bottomCard = document.querySelector(".floating-card.card-one");
  const countdownRibbon = document.querySelector(".featured-countdown-ribbon");
  const countdownLabel = countdownRibbon.querySelector(".featured-countdown-label");
  const countdownValue = countdownRibbon.querySelector(".featured-countdown-value");
  const transitionElements = [
    image,
    !productBadge.hidden && productBadge,
  ].filter(Boolean);
  const shouldAnimateTransition = previousSpotlightSlug !== null
    && previousSpotlightSlug !== spotlightSlug
    && !reducedMotionQuery.matches;

  if (shouldAnimateTransition && !isTransitionEntrance) {
    managedSpotlightTransitionInProgress = true;
    const exitAnimations = transitionElements.map((element) => {
      const opacity = Number.parseFloat(getComputedStyle(element).opacity);
      const transform = element === image ? getComputedStyle(image).transform : null;
      element.getAnimations().forEach((animation) => animation.cancel());
      return element === image
        ? element.animate(
          [
            { opacity, transform },
            { opacity: 0, transform: "scale(1.025)" },
          ],
          { duration: 380, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
        )
        : element.animate(
          [{ opacity }, { opacity: 0 }],
          { duration: 380, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
        );
    });
    Promise.all(exitAnimations.map((animation) => animation.finished.catch(() => null))).then(() => {
      managedSpotlightTransitionInProgress = false;
      renderManagedFeaturedProduct(card, true);
    });
    return true;
  }

  lastManagedSpotlightSlug = spotlightSlug;
  if (isTransitionEntrance) {
    transitionElements.forEach((element) => {
      element.getAnimations().forEach((animation) => animation.cancel());
    });
  }

  image.src = product.image;
  image.alt = localized.name;
  showcasePrice.dataset.priceSar = product.price;
  showcasePriceLabel.textContent = getHomepagePriceLabel();
  productBadge.textContent = saleActive
    ? `${discountPercent}% OFF`
    : translations[currentLang]?.[`tags.${product.badge === "new" ? "new" : "featured"}`] || copy.featured;
  formatHomepagePrices();

  topCard.querySelector("span").textContent = saleActive ? copy.sale : copy.featured;
  topCard.querySelector("strong").textContent = localized.name;
  const topDetail = topCard.querySelector("small");
  topDetail.replaceChildren();
  topDetail.classList.toggle("featured-sale-detail", saleActive);
  if (saleActive) {
    const discount = document.createElement("span");
    discount.className = "featured-discount-rate";
    const percentage = document.createElement("strong");
    percentage.className = "featured-discount-value";
    percentage.textContent = `${discountPercent}%`;
    const offerLabel = document.createElement("span");
    offerLabel.className = "featured-discount-off";
    offerLabel.textContent = "OFF";
    discount.append(percentage, offerLabel);
    const priceComparison = document.createElement("span");
    priceComparison.className = "featured-price-comparison";
    const oldPrice = document.createElement("s");
    oldPrice.textContent = formatShowcasePrice(regularPrice);
    const currentPrice = document.createElement("strong");
    currentPrice.textContent = formatShowcasePrice(product.price);
    priceComparison.append(oldPrice, document.createTextNode(" → "), currentPrice);
    topDetail.append(discount, priceComparison);
  } else {
    topDetail.textContent = formatShowcasePrice(product.price);
  }
  countdownRibbon.hidden = true;
  countdownLabel.textContent = "";
  countdownValue.textContent = "";

  const detailMode = showcase.bottom_detail || "description";
  const firstFeature = localized.features?.[0];
  const categoryEntry = window.NoursData?.getCategories?.().find((item) => item.slug === product.category);
  const categoryName = categoryEntry?.name_translations?.[currentLang] || categoryEntry?.name_translations?.en ||
    localized.category || product.category;
  const reviewCount = Number(product.reviews || 0);
  const reviewText = {
    ar: `${reviewCount} مراجعة`,
    fr: `${reviewCount} avis`,
    es: `${reviewCount} reseñas`,
    zh: `${reviewCount} 条评价`,
  }[currentLang] || `${reviewCount} reviews`;
  const bottomDetail = detailMode === "brand"
    ? `${product.brand} · ${categoryName}`
    : detailMode === "rating"
      ? `${Number(product.rating || 0).toFixed(1)} ★ · ${reviewText}`
      : detailMode === "feature"
        ? firstFeature || localized.description?.[currentLang] || localized.description?.en
        : localized.description?.[currentLang] || localized.description?.en || product.brand;
  bottomCard.querySelector("span").textContent = detailMode === "brand" ? copy.brand : detailMode === "rating" ? copy.rating : detailMode === "feature" ? copy.feature : copy.description;
  bottomCard.querySelector("strong").textContent = bottomDetail;
  bottomCard.querySelector("small").textContent = product.stock
    ? categoryName
    : (translations[currentLang]?.["tags.unavailable"] || "Out of stock");
  if (isTransitionEntrance && !reducedMotionQuery.matches) {
    const revealText = (element, delay = 0, duration = 1100) => {
      if (!element) return;
      element.getAnimations().forEach((animation) => animation.cancel());
      element.animate(
        [{ opacity: 0.25 }, { opacity: 1 }],
        { duration, delay, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "backwards" },
      );
    };
    image.getAnimations().forEach((animation) => animation.cancel());
    image.animate(
      [
        { opacity: 0.3, transform: "scale(1.035)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 1450, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "none" },
    );
    revealText(card.querySelector(".product-badge"), 40, 1000);
  }

  window.clearInterval(featuredCountdownTimer);
  const startsAt = showcase.sale_starts_at ? Date.parse(showcase.sale_starts_at) : null;
  const endsAt = Date.parse(showcase.sale_ends_at || product.saleEndsAt || "");
  const countdownTarget = saleActive ? endsAt : startsAt && startsAt > Date.now() ? startsAt : null;
  const hasCountdown = saleConfigured && Number.isFinite(countdownTarget);
  productBadge.hidden = hasCountdown;
  if (hasCountdown) {
    const updateCountdown = () => {
      const remaining = countdownTarget - Date.now();
      if (remaining <= 0) {
        const offerHasStarted = !saleActive && startsAt !== null && startsAt <= Date.now() && endsAt > Date.now();
        product.timedSaleActive = offerHasStarted;
        product.price = offerHasStarted ? salePrice : regularPrice;
        product.oldPrice = offerHasStarted ? regularPrice : null;
        product.badge = offerHasStarted ? "sale" : product.regularBadge === "sale" ? null : product.regularBadge;
        countdownRibbon.hidden = true;
        window.clearInterval(featuredCountdownTimer);
        window.dispatchEvent(new CustomEvent("ruqo:catalog-updated"));
        return;
      }
      const days = Math.floor(remaining / 86400000);
      const hours = Math.floor((remaining % 86400000) / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      countdownRibbon.hidden = false;
      countdownLabel.textContent = saleActive ? copy.ends : copy.begins;
      countdownValue.textContent = `${String(days).padStart(2, "0")}${copy.days} ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };
    updateCountdown();
    featuredCountdownTimer = window.setInterval(updateCountdown, 1000);
  }
  return true;
}

function renderFeaturedProduct() {
  const card = document.querySelector(".highlight-card");
  if (!card) return;
  const heroVisual = document.querySelector(".hero-visual");
  const hero = document.querySelector(".hero");
  const spotlights = window.RUQO_HOME_SPOTLIGHTS;
  if (spotlights === undefined && window.RUQO_SUPABASE_CONFIG?.url) {
    return;
  }
  if (!Array.isArray(spotlights) || !spotlights.length) {
    heroVisual.hidden = true;
    hero?.classList.add("has-no-showcase");
    lastManagedSpotlightSlug = null;
    window.clearInterval(featuredProductTimer);
    window.clearInterval(featuredCountdownTimer);
    return;
  }
  heroVisual.hidden = false;
  hero?.classList.remove("has-no-showcase");
  window.clearInterval(featuredCountdownTimer);
  if (renderManagedFeaturedProduct(card)) {
    return;
  }

  const product = featuredProducts[featuredProductIndex];
  const content = product[currentLang] || product.en;
  const image = card.querySelector(".featured-product-image");
  const showcasePrice = card.querySelector(".hero-showcase-price-value");

  card.classList.add("is-changing");
  window.setTimeout(() => {
    image.src = product.image;
    image.alt = content.alt;
    showcasePrice.dataset.priceSar = product.price.replaceAll(",", "");
    card.querySelector(".hero-showcase-price-label").textContent = getHomepagePriceLabel();
    card.querySelector(".product-badge").textContent = content.badge;
    formatHomepagePrices();
    card.classList.remove("is-changing");
  }, 180);
}

function syncHomepageCatalog() {
  const catalog = window.NoursData;
  renderManagedCategories();
  if (!catalog?.products?.length) return;
  const dictionary = translations[currentLang] || translations.en || {};
  document.querySelectorAll(".product-grid .product-card").forEach((card) => {
    const link = card.querySelector(".product-info h3 a");
    if (!link) return;
    const slug = new URL(link.href).searchParams.get("id");
    const product = catalog.products.find((item) => item.id === slug);
    if (!product) return;
    const localized = catalog.localizeProduct(product, currentLang);
    link.textContent = localized.name;
    card.querySelector(".product-info p").textContent =
      localized.description[currentLang] || localized.description.en;
    card.querySelector(".product-meta .rating").textContent =
      `★★★★★ ${Number(product.rating).toFixed(1)}`;
    const price = card.querySelector("[data-price-sar]");
    price.dataset.priceSar = product.price;
    const tag = card.querySelector(".tag");
    if (tag) {
      const tagName = product.badge === "sale" ? "sale" : product.badge === "new" ? "new" : "featured";
      tag.className = `tag${product.badge === "sale" ? " tag-sale" : ""}`;
      tag.textContent = dictionary[`tags.${tagName}`] || product.badge || "";
    }
    const image = card.querySelector(".product-image");
    if (image && product.image) image.style.backgroundImage = `url("${product.image}")`;
  });
  const mbp = catalog.products.find((item) => item.id === "macbook-pro");
  if (mbp && featuredProducts[1]) {
    featuredProducts[1].price = new Intl.NumberFormat("en-US").format(mbp.price);
    const heroPrice = document.querySelector(".highlight-card [data-price-sar]");
    if (heroPrice && featuredProductIndex === 1) {
      heroPrice.dataset.priceSar = mbp.price;
    }
  }
  formatHomepagePrices();
  renderFeaturedProduct();
}

function setupCategoryCarousel() {
  const grid = document.querySelector("#categories .category-grid");
  if (!grid) return null;
  const carousel = document.createElement("div");
  carousel.className = "category-carousel";
  carousel.setAttribute("role", "region");
  grid.before(carousel);
  carousel.append(grid);
  grid.id = "category-track";
  grid.tabIndex = 0;
  const controls = document.createElement("div");
  controls.className = "category-carousel-controls";
  const [previous, pause, next] = ["previous", "pause", "next"].map((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `category-carousel-button category-carousel-${action}`;
    button.setAttribute("aria-controls", grid.id);
    controls.append(button);
    return button;
  });
  carousel.append(controls);
  let timer;
  let hovered = false;
  let pressed = false;
  let paused = false;
  let visible = false;
  let autoStep = 1;
  let copy;

  function setControlIcon(button, name) {
    if (button.dataset.icon === name) return;
    const paths = {
      left: "m14 6-6 6 6 6",
      right: "m10 6 6 6-6 6",
      pause: "M9 5v14M15 5v14",
      play: "m9 5 10 7-10 7Z",
    };
    button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${paths[name]}"/></svg>`;
    button.dataset.icon = name;
  }

  function updateAutoplay() {
    window.clearTimeout(timer);
    setControlIcon(pause, paused ? "play" : "pause");
    pause.setAttribute("aria-label", paused ? copy.play : copy.pause);
    pause.title = paused ? copy.play : copy.pause;
    pause.hidden = reducedMotionQuery.matches;
    if (controls.hidden || paused || hovered || pressed || !visible ||
        reducedMotionQuery.matches || document.visibilityState !== "visible" ||
        carousel.contains(document.activeElement)) return;
    timer = window.setTimeout(() => {
      if (next.disabled) autoStep = -1;
      else if (previous.disabled) autoStep = 1;
      scrollCards(autoStep);
      updateAutoplay();
    }, 4000);
  }

  function updateNavigation() {
    const bounds = grid.getBoundingClientRect();
    const rtl = getComputedStyle(grid).direction === "rtl";
    const first = grid.firstElementChild?.getBoundingClientRect();
    const last = grid.lastElementChild?.getBoundingClientRect();
    controls.hidden = grid.scrollWidth <= grid.clientWidth + 1;
    previous.disabled = !first || (rtl ? first.right <= bounds.right + 1 : first.left >= bounds.left - 1);
    next.disabled = !last || (rtl ? last.left >= bounds.left - 1 : last.right <= bounds.right + 1);
    updateAutoplay();
  }

  function scrollCards(step) {
    const cards = grid.children;
    const stride = cards.length > 1 ? Math.abs(cards[1].offsetLeft - cards[0].offsetLeft) : grid.clientWidth;
    grid.scrollBy({
      left: step * stride * (getComputedStyle(grid).direction === "rtl" ? -1 : 1),
      behavior: reducedMotionQuery.matches ? "auto" : "smooth",
    });
  }

  function refresh() {
    copy = {
      en: { previous: "Previous categories", next: "Next categories", pause: "Pause category rotation", play: "Resume category rotation" },
      ar: { previous: "التصنيفات السابقة", next: "التصنيفات التالية", pause: "إيقاف حركة التصنيفات", play: "استئناف حركة التصنيفات" },
      fr: { previous: "Catégories précédentes", next: "Catégories suivantes", pause: "Mettre les catégories en pause", play: "Reprendre les catégories" },
      es: { previous: "Categorías anteriores", next: "Categorías siguientes", pause: "Pausar las categorías", play: "Reanudar las categorías" },
      zh: { previous: "上一组分类", next: "下一组分类", pause: "暂停分类轮播", play: "继续分类轮播" },
    }[currentLang] || { previous: "Previous categories", next: "Next categories", pause: "Pause category rotation", play: "Resume category rotation" };
    const title = document.querySelector("#categories h2")?.textContent || "Product Categories";
    carousel.setAttribute("aria-label", title);
    grid.setAttribute("aria-label", title);
    const rtl = getComputedStyle(grid).direction === "rtl";
    setControlIcon(previous, rtl ? "right" : "left");
    setControlIcon(next, rtl ? "left" : "right");
    for (const [button, label] of [[previous, copy.previous], [next, copy.next]]) {
      button.setAttribute("aria-label", label);
      button.title = label;
    }
    grid.scrollLeft = 0;
    autoStep = 1;
    updateNavigation();
  }

  previous.addEventListener("click", () => scrollCards(-1));
  next.addEventListener("click", () => scrollCards(1));
  pause.addEventListener("click", () => {
    paused = !paused;
    updateAutoplay();
  });
  grid.addEventListener("scroll", updateNavigation, { passive: true });
  grid.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    scrollCards((event.key === "ArrowRight" ? 1 : -1) * (getComputedStyle(grid).direction === "rtl" ? -1 : 1));
  });
  carousel.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;
    hovered = true;
    updateAutoplay();
  });
  carousel.addEventListener("pointerleave", () => {
    hovered = false;
    updateAutoplay();
  });
  carousel.addEventListener("pointerdown", () => {
    pressed = true;
    updateAutoplay();
  });
  const release = () => {
    pressed = false;
    updateAutoplay();
  };
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
  carousel.addEventListener("focusin", updateAutoplay);
  carousel.addEventListener("focusout", () => window.requestAnimationFrame(updateAutoplay));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") pressed = false;
    updateAutoplay();
  });
  reducedMotionQuery.addEventListener("change", updateAutoplay);
  new ResizeObserver(updateNavigation).observe(grid);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
    updateAutoplay();
  }, { threshold: 0.25 }).observe(grid);
  refresh();
  return { refresh };
}

function renderManagedCategories() {
  const categories = window.NoursData?.getCategories();
  const grid = document.querySelector(".category-grid");
  if (!categories || !grid) return;
  const defaultImages = {
    phones: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    laptops: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    audio: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
    wearables: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
  };
  const cards = categories.map((category) => {
    const link = document.createElement("a");
    link.href = `/products.html?category=${encodeURIComponent(category.slug)}`;
    link.className = "category-card feature-card";
    const image = document.createElement("img");
    image.className = "category-image";
    image.src = category.image || defaultImages[category.slug] || defaultLightLogoUrl;
    image.alt = "";
    image.loading = "lazy";
    const content = document.createElement("div");
    content.className = "category-content";
    const heading = document.createElement("h3");
    heading.textContent = category.name_translations?.[currentLang] || category.name_translations?.en || category.slug;
    const description = document.createElement("p");
    description.textContent = category.description_translations?.[currentLang] || category.description_translations?.en || translations[currentLang]?.[`cats.${category.slug}Text`] || "";
    const count = document.createElement("span");
    const countText = new Intl.NumberFormat(localeByLanguage[currentLang] || localeByLanguage.en).format(category.productCount);
    count.textContent = {
      en: `${countText} products`, ar: `${countText} منتجات`, fr: `${countText} produits`,
      es: `${countText} productos`, zh: `${countText} 件商品`,
    }[currentLang] || `${countText} products`;
    content.append(heading, description, count);
    link.append(image, content);
    return link;
  });
  grid.replaceChildren(...cards);
  categoryCarousel?.refresh();
}

function formatHomepagePrices() {
  const currency = window.NoursStore?.getCurrency() || "USD";
  const rates = { SAR: 1, USD: 1 / 3.75, EUR: 0.245 };
  const locale = localeByLanguage[currentLang] || localeByLanguage.en;
  document.querySelectorAll("[data-price-sar]").forEach((node) => {
    const amount = Number(node.dataset.priceSar) * rates[currency];
    if (node.closest(".price-block")) {
      node.textContent = new Intl.NumberFormat(locale, {
        maximumFractionDigits: currency === "SAR" ? 0 : 2,
      }).format(amount);
    } else {
      node.textContent = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "SAR" ? 0 : 2,
      }).format(amount);
    }
  });
  document.querySelectorAll(".price-block small").forEach((node) => {
    node.textContent = currency;
  });
  const select = document.querySelector("[data-currency-select]");
  if (select && select.value !== currency) {
    select.value = currency;
  }
}

function advanceFeaturedProduct() {
  if (window.RUQO_HOME_SPOTLIGHTS?.length) {
    managedSpotlightIndex = (managedSpotlightIndex + 1) % window.RUQO_HOME_SPOTLIGHTS.length;
  } else {
    featuredProductIndex = (featuredProductIndex + 1) % featuredProducts.length;
  }
  renderFeaturedProduct();
}

function updateFeaturedProductTimer() {
  window.clearInterval(featuredProductTimer);
  const spotlights = window.RUQO_HOME_SPOTLIGHTS || [];
  const shouldRotate = spotlights.length > 1;
  if (shouldRotate && !reducedMotionQuery.matches && document.visibilityState === "visible") {
    featuredProductTimer = window.setInterval(advanceFeaturedProduct, 5000);
  }
}

function bannerText(banner, field, fallback = "") {
  const translations = banner?.[field] || {};
  return translations[currentLang] || translations.en || fallback;
}

function bannerBackground(url) {
  try {
    const image = new URL(url, window.location.origin);
    if (!["http:", "https:"].includes(image.protocol)) return "";
    return `linear-gradient(135deg, rgba(12, 36, 34, 0.08), rgba(12, 36, 34, 0.32)), url("${image.href}")`;
  } catch {
    return "";
  }
}

function renderPublishedHomeCopy() {
  const published = window.RUQO_HOME_COPY?.translations;
  if (!published) return;
  const copy = published[currentLang] || published.en;
  if (!copy || typeof copy.title !== "string" || !copy.title.trim() ||
      typeof copy.eyebrow !== "string" || typeof copy.text !== "string") {
    console.warn("Published homepage copy is incomplete; retaining existing content.");
    return;
  }
  for (const [field, selector] of Object.entries({
    eyebrow: ".hero-copy .eyebrow",
    title: ".hero-copy h1",
    text: ".hero-copy > p",
  })) {
    const node = document.querySelector(selector);
    if (!node) continue;
    node.textContent = copy[field];
    node.hidden = !copy[field].trim();
    // Some hero badge styles explicitly set display and otherwise override [hidden].
    if (node.hidden) node.style.setProperty("display", "none");
    else node.style.removeProperty("display");
  }
}

function renderManagedHomeBanners() {
  const banners = window.RUQO_STORE_BANNERS || [];
  const heroBanner = banners.find((banner) => banner.placement === "home_hero");
  const promoBanner = banners.find((banner) => banner.placement === "home_promo");
  if (heroBanner) {
    const hero = document.querySelector(".hero");
    const eyebrow = hero?.querySelector(".hero-copy .eyebrow");
    const heading = hero?.querySelector(".hero-copy h1");
    const description = hero?.querySelector(".hero-copy > p");
    const primaryAction = hero?.querySelector(".cta-group .primary-btn");
    if (eyebrow) eyebrow.textContent = currentLang === "ar" ? "محتوى المتجر" : "STORE SPOTLIGHT";
    if (heading) heading.textContent = bannerText(heroBanner, "title_translations", heading.textContent);
    if (description) description.textContent = bannerText(heroBanner, "description_translations", description.textContent);
    if (primaryAction) {
      primaryAction.textContent = bannerText(heroBanner, "button_translations", primaryAction.textContent);
      primaryAction.href = heroBanner.destination_url || "/products.html";
    }
    const visual = hero?.querySelector(".hero-visual");
    if (visual && heroBanner.image_url) {
      visual.style.backgroundImage = bannerBackground(heroBanner.image_url);
      visual.classList.add("has-managed-image");
    }
  }
  const promo = document.querySelector("#deals");
  if (promoBanner && promo) {
    promo.querySelector(".promo-copy .eyebrow").textContent = currentLang === "ar" ? "عرض المتجر" : "STORE OFFER";
    promo.querySelector(".promo-copy h2").textContent = bannerText(promoBanner, "title_translations");
    promo.querySelector(".promo-copy p").textContent = bannerText(promoBanner, "description_translations");
    const button = promo.querySelector(".promo-copy a");
    button.textContent = bannerText(promoBanner, "button_translations", currentLang === "ar" ? "تسوق الآن" : "Shop now");
    button.href = promoBanner.destination_url || "/products.html";
    const visual = promo.querySelector(".promo-visual");
    if (visual && promoBanner.image_url) {
      visual.style.backgroundImage = bannerBackground(promoBanner.image_url);
      visual.classList.add("has-managed-image");
    }
  }
  renderPublishedHomeCopy();
}

window.addEventListener("ruqo:home-copy-updated", renderManagedHomeBanners);
reducedMotionQuery.addEventListener("change", updateFeaturedProductTimer);
document.addEventListener("visibilitychange", updateFeaturedProductTimer);
updateFeaturedProductTimer();
window.addEventListener("ruqo:catalog-updated", syncHomepageCatalog);
window.addEventListener("ruqo:home-spotlights-updated", () => {
  managedSpotlightIndex = 0;
  renderFeaturedProduct();
  updateFeaturedProductTimer();
});
window.addEventListener("ruqo:store-settings-updated", renderFeaturedProduct);
window.addEventListener("ruqo:store-banners-updated", () => {
  renderManagedHomeBanners();
  renderMobileAd();
});
window.RUQO_SUPABASE_READY?.then((loaded) => {
  if (loaded) syncHomepageCatalog();
});
window.RUQO_HOME_SPOTLIGHTS_READY?.then(() => {
  renderFeaturedProduct();
  updateFeaturedProductTimer();
});

function renderMobileAdControls(managedBanner) {
  const shell = document.querySelector(".mobile-ad-shell");
  if (!shell) return;
  const controls = shell.querySelector(".mobile-ad-controls");
  const copy = {
    en: { offers: "Featured offers", offer: "Show offer", pause: "Pause offers", play: "Resume offers" },
    ar: { offers: "عروض مختارة", offer: "عرض الإعلان", pause: "إيقاف تبديل العروض", play: "استئناف تبديل العروض" },
    fr: { offers: "Offres à découvrir", offer: "Afficher l’offre", pause: "Mettre en pause", play: "Reprendre les offres" },
    es: { offers: "Ofertas destacadas", offer: "Mostrar oferta", pause: "Pausar ofertas", play: "Reanudar ofertas" },
    zh: { offers: "精选推荐", offer: "显示推荐", pause: "暂停轮播", play: "继续轮播" },
  }[currentLang] || { offers: "Featured offers", offer: "Show offer", pause: "Pause offers", play: "Resume offers" };
  shell.setAttribute("role", "region");
  shell.setAttribute("aria-label", copy.offers);
  const count = managedBanner ? 1 : mobileAdSlides.length;
  controls.hidden = count <= 1;
  shell.classList.toggle("has-controls", !controls.hidden);
  if (!shell.dataset.controlsReady) {
    shell.dataset.controlsReady = "true";
    shell.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;
      mobileAdHovered = true;
      updateMobileAdTimer();
    });
    shell.addEventListener("pointerleave", () => {
      mobileAdHovered = false;
      updateMobileAdTimer();
    });
    shell.addEventListener("focusin", () => window.clearInterval(mobileAdTimer));
    shell.addEventListener("focusout", (event) => {
      if (!shell.contains(event.relatedTarget)) updateMobileAdTimer();
    });
  }
  if (controls.hidden) return;
  if (!controls.childElementCount) {
    mobileAdSlides.forEach((slide, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "mobile-ad-dot";
      dot.addEventListener("click", () => {
        mobileAdIndex = index;
        renderMobileAd();
      });
      controls.append(dot);
    });
    const pause = document.createElement("button");
    pause.type = "button";
    pause.className = "mobile-ad-pause";
    pause.addEventListener("click", () => {
      mobileAdPaused = !mobileAdPaused;
      renderMobileAdControls(null);
      updateMobileAdTimer();
    });
    controls.append(pause);
  }
  controls.querySelectorAll(".mobile-ad-dot").forEach((dot, index) => {
    const slide = mobileAdSlides[index][currentLang] || mobileAdSlides[index].en;
    dot.setAttribute("aria-label", `${copy.offer} ${index + 1}: ${slide.copy}`);
    dot.setAttribute("aria-pressed", String(index === mobileAdIndex));
  });
  const pause = controls.querySelector(".mobile-ad-pause");
  pause.hidden = reducedMotionQuery.matches;
  pause.setAttribute("aria-label", mobileAdPaused ? copy.play : copy.pause);
  pause.setAttribute("aria-pressed", String(mobileAdPaused));
  const icon = document.createElement("i");
  icon.dataset.lucide = mobileAdPaused ? "play" : "pause";
  icon.setAttribute("aria-hidden", "true");
  pause.replaceChildren(icon);
  window.lucide?.createIcons();
}

function renderMobileAd() {
  const banner = document.querySelector(".mobile-ad-banner");
  if (!banner) return;

  const managedBanner = (window.RUQO_STORE_BANNERS || []).find((item) => item.placement === "mobile_promo");
  const slide = mobileAdSlides[mobileAdIndex];
  const localCopy = slide[currentLang] || slide.en;
  const copy = managedBanner
    ? {
        label: currentLang === "ar" ? "عرض المتجر" : "STORE OFFER",
        copy: bannerText(managedBanner, "description_translations") || bannerText(managedBanner, "title_translations"),
        action: bannerText(managedBanner, "button_translations", currentLang === "ar" ? "تسوق" : "Shop now"),
      }
    : localCopy;
  const image = banner.querySelector(".mobile-ad-image");
  const imageUrl = managedBanner?.mobile_image_url || managedBanner?.image_url || slide.image;

  renderMobileAdControls(managedBanner);
  window.clearTimeout(mobileAdTransitionTimer);
  banner.classList.add("is-changing");
  mobileAdTransitionTimer = window.setTimeout(() => {
    image.src = imageUrl;
    banner.href = managedBanner?.destination_url || (managedBanner ? "/products.html" : slide.href);
    banner.querySelector(".mobile-ad-label").textContent = copy.label;
    banner.querySelector(".mobile-ad-copy").textContent = copy.copy;
    banner.querySelector(".mobile-ad-action-label").textContent = copy.action
      .replace(/[←→]/g, "")
      .trim();
    banner.classList.remove("is-changing");
  }, reducedMotionQuery.matches ? 0 : 180);
  updateMobileAdTimer();
}

function advanceMobileAd() {
  mobileAdIndex = (mobileAdIndex + 1) % mobileAdSlides.length;
  renderMobileAd();
}

function updateMobileAdTimer() {
  window.clearInterval(mobileAdTimer);
  if (
    mobileViewportQuery.matches &&
    !reducedMotionQuery.matches &&
    !mobileAdPaused &&
    !mobileAdHovered &&
    !document.querySelector(".mobile-ad-shell")?.contains(document.activeElement) &&
    !(window.RUQO_STORE_BANNERS || []).some((item) => item.placement === "mobile_promo") &&
    document.visibilityState === "visible"
  ) {
    mobileAdTimer = window.setInterval(advanceMobileAd, 5500);
  }
}

mobileViewportQuery.addEventListener("change", updateMobileAdTimer);
reducedMotionQuery.addEventListener("change", () => {
  renderMobileAd();
});
document.addEventListener("visibilitychange", updateMobileAdTimer);
updateMobileAdTimer();

function applyTranslations(lang) {
  const renderRatingIcons = () => {
    document.querySelectorAll(".rating").forEach((rating) => {
      const score = rating.textContent.match(/\d+(?:\.\d+)?/)?.[0];
      if (!score) return;

      const star = document.createElement("i");
      star.dataset.lucide = "star";
      star.setAttribute("aria-hidden", "true");
      const value = document.createElement("span");
      value.textContent = score;
      rating.replaceChildren(star, value);
      rating.setAttribute("role", "img");
      rating.setAttribute(
        "aria-label",
        { ar: `التقييم ${score} من 5`, fr: `Note : ${score} sur 5`, es: `Valoración: ${score} de 5`, zh: `评分：${score} 分（满分 5 分）` }[lang] || `${score} out of 5 stars`,
      );
    });

    document.querySelectorAll(".stars").forEach((stars) => {
      const starIcons = Array.from({ length: 5 }, () => {
        const star = document.createElement("i");
        star.dataset.lucide = "star";
        star.setAttribute("aria-hidden", "true");
        return star;
      });
      stars.replaceChildren(...starIcons);
      stars.setAttribute("role", "img");
      stars.setAttribute(
        "aria-label",
        { ar: "5 من 5 نجوم", fr: "5 étoiles sur 5", es: "5 de 5 estrellas", zh: "满分 5 星" }[lang] || "5 out of 5 stars",
      );
    });

    window.lucide?.createIcons();
  };

  renderRatingIcons();
  const dictionary = translations[lang] || translations.en || {};
  document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  const storeName = window.RUQO_STORE_SETTINGS?.store_name || "WEEXEY";
  document.title = {
    en: "WEEXEY | Premium Electronics Store",
    fr: "WEEXEY | Boutique high-tech premium",
    es: "WEEXEY | Tienda premium de electrónica",
    zh: "WEEXEY | 高端电子产品商店",
    ar: "WEEXEY | متجر إلكترونيات فاخر",
  }[lang].replace("WEEXEY", storeName);
  window.NoursStore?.setLanguage(lang);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dictionary[key]) {
      el.textContent = dictionary[key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dictionary[key]) {
      el.setAttribute("placeholder", dictionary[key]);
    }
  });

  const iconLabels = {
    search: { ar: "بحث", en: "Search", fr: "Rechercher", es: "Buscar", zh: "搜索" },
    wishlist: { ar: "المفضلة", en: "Wishlist", fr: "Favoris", es: "Favoritos", zh: "心愿单" },
    cart: {
      ar: `السلة، ${new Intl.NumberFormat("ar-SA").format(window.NoursStore?.cartCount() || 0)} منتجات`,
      en: `Cart, ${window.NoursStore?.cartCount() || 0} items`,
      fr: `Panier, ${window.NoursStore?.cartCount() || 0} articles`,
      es: `Carrito, ${window.NoursStore?.cartCount() || 0} artículos`,
      zh: `购物袋，${window.NoursStore?.cartCount() || 0} 件商品`,
    },
    menu: { ar: "فتح القائمة", en: "Open menu", fr: "Ouvrir le menu", es: "Abrir menú", zh: "打开菜单" },
    menuClose: { ar: "إغلاق القائمة", en: "Close menu", fr: "Fermer le menu", es: "Cerrar menú", zh: "关闭菜单" },
  };

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    const menuIsOpen =
      key === "menu" && el.getAttribute("aria-expanded") === "true";
    const label = menuIsOpen
      ? iconLabels.menuClose[lang]
      : dictionary[key] || iconLabels[key]?.[lang] || iconLabels[key]?.en;
    if (label) {
      el.setAttribute("aria-label", label);
    }
  });
  const cartCount = document.querySelector("[data-cart-count]");
  if (cartCount) {
    cartCount.textContent = new Intl.NumberFormat(
      localeByLanguage[lang] || localeByLanguage.en,
    ).format(window.NoursStore?.cartCount() || 0);
  }

  if (languageSelect) {
    languageSelect.value = lang;
    languageSelect.setAttribute(
      "aria-label",
      { en: "Language", fr: "Langue", es: "Idioma", zh: "语言", ar: "اللغة" }[lang] || "Language",
    );
  }

  const body = document.body;
  body.classList.toggle("is-english", lang === "en");
  formatHomepagePrices();
  renderMobileAd();
  renderFeaturedProduct();
  syncHomepageCatalog();
  renderManagedHomeBanners();
  window.NoursStore?.syncDropdowns();
  window.RUQO_APPLY_FOOTER_SETTINGS?.(document.querySelector(".site-footer"), lang);
}

if (languageSelect) {
  languageSelect.addEventListener("change", (event) => {
    currentLang = event.currentTarget.value;
    applyTranslations(currentLang);
  });
}
// Other language controls (mobile drawer, assistant) update the shared store; keep this page in sync.
window.addEventListener("ruqo:language-updated", (event) => {
  const next = event.detail?.language;
  if (!next || next === currentLang) return;
  currentLang = next;
  if (languageSelect) languageSelect.value = next;
  applyTranslations(currentLang);
});
window.addEventListener("ruqo:store-settings-updated", () => {
  window.RUQO_APPLY_FOOTER_SETTINGS?.(document.querySelector(".site-footer"), currentLang);
});

const mainCurrencySelect = document.querySelector("[data-currency-select]");
if (mainCurrencySelect) {
  mainCurrencySelect.value = window.NoursStore?.getCurrency() || "USD";
  mainCurrencySelect.addEventListener("change", (event) => {
    window.NoursStore?.setCurrency(event.currentTarget.value);
    formatHomepagePrices();
  });
}
window.addEventListener("ruqo:currency-updated", (event) => {
  if (mainCurrencySelect) {
    mainCurrencySelect.value = event.detail?.currency || window.NoursStore?.getCurrency() || "USD";
  }
  formatHomepagePrices();
});

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav && !window.NoursStore?.setupProductSideMenu) {
  const setMenuOpen = (isOpen) => {
    mainNav.classList.toggle("open", isOpen);
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      ({
        ar: isOpen ? "إغلاق القائمة" : "فتح القائمة",
        fr: isOpen ? "Fermer le menu" : "Ouvrir le menu",
        es: isOpen ? "Cerrar menú" : "Abrir menú",
        zh: isOpen ? "关闭菜单" : "打开菜单",
      }[currentLang] || (isOpen ? "Close menu" : "Open menu")),
    );
  };

  menuToggle.addEventListener("click", () => {
    setMenuOpen(!mainNav.classList.contains("open"));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("click", (event) => {
    if (
      mainNav.classList.contains("open") &&
      !mainNav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNav.classList.contains("open")) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
}

const revealItems = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

revealItems.forEach((item) => observer.observe(item));

const newsletterForm = document.querySelector(".newsletter-form");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = newsletterForm.querySelector("button");
    const input = newsletterForm.querySelector("input");
    let feedback = newsletterForm.parentElement.querySelector("[data-newsletter-feedback]");
    if (!feedback) {
      feedback = document.createElement("p");
      feedback.dataset.newsletterFeedback = "";
      feedback.setAttribute("role", "status");
      newsletterForm.after(feedback);
    }
    if (!input.reportValidity()) return;
    if (!window.RUQO_SUPABASE) {
      feedback.textContent = currentLang === "ar" ? "تعذر الاتصال بالخدمة. حاول لاحقاً." : "The subscription service is unavailable. Try again later.";
      return;
    }
    const originalText = button.textContent;
    button.disabled = true;
    feedback.textContent = "";
    try {
      const email = input.value.trim().toLowerCase();
      const { error } = await window.RUQO_SUPABASE.from("newsletter_subscriptions").insert({ email });
      if (error && error.code !== "23505") throw error;
      feedback.textContent = {
        ar: "تم تسجيل بريدك بنجاح.",
        fr: "Votre adresse est inscrite.",
        es: "Tu correo se ha suscrito.",
        zh: "邮箱已成功订阅。",
      }[currentLang] || "Your email has been subscribed.";
      input.value = "";
    } catch {
      feedback.textContent = currentLang === "ar" ? "لم نتمكن من حفظ الاشتراك. حاول مرة أخرى." : "We couldn't save your subscription. Please try again.";
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  });
}

document.querySelectorAll(".product-card").forEach((card) => {
  const image = card.querySelector(".product-image");
  const productLink = card.querySelector(".product-info h3 a");
  if (!image || !productLink) return;
  const imageLink = document.createElement("a");
  imageLink.className = "product-image-link";
  imageLink.href = productLink.href;
  imageLink.setAttribute("aria-label", productLink.textContent.trim());
  image.prepend(imageLink);
});

applyTranslations(currentLang);
