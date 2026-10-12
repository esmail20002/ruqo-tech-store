(() => {
  const products = [
    {
      id: "macbook-pro",
      brand: "Apple",
      name: "MacBook Pro 14 M4",
      category: "laptops",
      description: {
        en: "Liquid Retina XDR · 16GB unified memory",
        ar: "شاشة Liquid Retina XDR · ذاكرة 16GB",
      },
      price: 5000,
      oldPrice: 9299,
      rating: 4.9,
      reviews: 248,
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=85",
      badge: "popular",
      stock: true,
      newest: 12,
      features: {
        en: [
          "14-inch Liquid Retina XDR display",
          "Apple M4 chip",
          "16GB unified memory",
          "All-day battery life",
        ],
        ar: [
          "شاشة Liquid Retina XDR مقاس 14 بوصة",
          "شريحة Apple M4",
          "ذاكرة موحدة 16GB",
          "بطارية تدوم طوال اليوم",
        ],
      },
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
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85",
      badge: "sale",
      stock: true,
      newest: 11,
      features: {
        en: [
          "200MP pro-grade camera",
          "512GB storage",
          "Galaxy AI features",
          "Dynamic AMOLED display",
        ],
        ar: [
          "كاميرا احترافية بدقة 200MP",
          "سعة تخزين 512GB",
          "ميزات Galaxy AI",
          "شاشة Dynamic AMOLED",
        ],
      },
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
        "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1000&q=85",
      badge: "sale",
      stock: true,
      newest: 10,
      features: {
        en: [
          "Active Noise Cancellation",
          "Adaptive Audio and Transparency",
          "USB-C MagSafe charging case",
          "Personalized spatial audio",
        ],
        ar: [
          "إلغاء ضجيج نشط",
          "صوت متكيف ووضع شفافية",
          "علبة شحن MagSafe بمنفذ USB-C",
          "صوت مكاني مخصص",
        ],
      },
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
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85",
      badge: "new",
      stock: true,
      newest: 9,
      features: {
        en: [
          "Advanced sleep coaching",
          "Heart rate and wellness tracking",
          "Built-in GPS",
          "Water resistant design",
        ],
        ar: [
          "تحليل متقدم للنوم",
          "متابعة نبض القلب والصحة",
          "GPS مدمج",
          "تصميم مقاوم للماء",
        ],
      },
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
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85",
      badge: "new",
      stock: true,
      newest: 8,
      features: {
        en: [
          "14-inch 3K OLED touchscreen",
          "Intel Core Ultra 7 processor",
          "Lightweight aluminum chassis",
          "Fast USB-C connectivity",
        ],
        ar: [
          "شاشة لمس OLED بدقة 3K مقاس 14 بوصة",
          "معالج Intel Core Ultra 7",
          "هيكل ألمنيوم خفيف",
          "منافذ USB-C سريعة",
        ],
      },
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
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=85",
      badge: "popular",
      stock: true,
      newest: 7,
      features: {
        en: [
          "A18 Pro chip",
          "Pro camera system",
          "256GB storage",
          "Titanium design",
        ],
        ar: [
          "شريحة A18 Pro",
          "نظام كاميرات Pro",
          "سعة تخزين 256GB",
          "تصميم من التيتانيوم",
        ],
      },
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
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=85",
      badge: "sale",
      stock: true,
      newest: 6,
      features: {
        en: [
          "Industry-leading noise cancellation",
          "Up to 30 hours battery",
          "Crystal-clear hands-free calls",
          "Lightweight comfort",
        ],
        ar: [
          "عزل ضجيج رائد",
          "بطارية تصل إلى 30 ساعة",
          "مكالمات واضحة دون استخدام اليدين",
          "راحة وخفة للاستخدام اليومي",
        ],
      },
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
        "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=1000&q=85",
      badge: "new",
      stock: true,
      newest: 5,
      features: {
        en: [
          "Thinner, lighter design",
          "Advanced health sensors",
          "Always-On Retina display",
          "Fast charging",
        ],
        ar: [
          "تصميم أنحف وأخف",
          "مستشعرات صحية متقدمة",
          "شاشة Retina دائمة التشغيل",
          "شحن سريع",
        ],
      },
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
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1000&q=85",
      badge: "popular",
      stock: true,
      newest: 4,
      features: {
        en: [
          "Apple M3 chip",
          "11-inch Liquid Retina display",
          "Works with Apple Pencil",
          "All-day battery life",
        ],
        ar: [
          "شريحة Apple M3",
          "شاشة Liquid Retina مقاس 11 بوصة",
          "متوافق مع Apple Pencil",
          "بطارية تدوم طوال اليوم",
        ],
      },
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
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85",
      badge: "popular",
      stock: false,
      newest: 3,
      features: {
        en: [
          "Immersive spatial audio",
          "World-class noise cancellation",
          "Premium soft materials",
          "Personalized listening modes",
        ],
        ar: [
          "صوت مكاني غامر",
          "عزل ضجيج بمستوى عالمي",
          "خامات ناعمة وفاخرة",
          "أوضاع استماع مخصصة",
        ],
      },
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
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=85",
      badge: "sale",
      stock: true,
      newest: 2,
      features: {
        en: [
          "13.4-inch InfinityEdge display",
          "Intel Core Ultra 5",
          "Premium CNC aluminum body",
          "ExpressCharge support",
        ],
        ar: [
          "شاشة InfinityEdge مقاس 13.4 بوصة",
          "معالج Intel Core Ultra 5",
          "هيكل ألمنيوم فاخر",
          "يدعم ExpressCharge",
        ],
      },
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
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85",
      badge: "new",
      stock: false,
      newest: 1,
      features: {
        en: [
          "Google AI built in",
          "Pro triple camera system",
          "Bright Super Actua display",
          "Seven years of updates",
        ],
        ar: [
          "ميزات Google AI مدمجة",
          "نظام كاميرا ثلاثي احترافي",
          "شاشة Super Actua ساطعة",
          "سبع سنوات من التحديثات",
        ],
      },
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
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=85",
      badge: "sale",
      stock: true,
      newest: 0,
      features: {
        en: [
          "Stress management tools",
          "ECG and heart health",
          "Up to 6 days battery",
          "Built-in GPS",
        ],
        ar: [
          "أدوات لإدارة التوتر",
          "تخطيط القلب ومتابعة صحته",
          "بطارية تصل إلى 6 أيام",
          "GPS مدمج",
        ],
      },
    },
  ];
  const localizedProductCopy = {
    fr: {
      "macbook-pro": { description: "Écran Liquid Retina XDR · mémoire unifiée 16 Go", features: ["Écran Liquid Retina XDR de 14 pouces", "Puce Apple M4", "Mémoire unifiée de 16 Go", "Autonomie pour toute la journée"] },
      "galaxy-s25": { description: "Appareil photo 200 MP · stockage 512 Go", features: ["Appareil photo professionnel de 200 MP", "Stockage de 512 Go", "Fonctions Galaxy AI", "Écran Dynamic AMOLED"] },
      "airpods-pro": { description: "Réduction active du bruit · USB-C", features: ["Réduction active du bruit", "Audio adaptatif et mode Transparence", "Boîtier de charge MagSafe USB-C", "Audio spatial personnalisé"] },
      "galaxy-watch": { description: "Suivi avancé de la santé · GPS", features: ["Coaching avancé du sommeil", "Suivi du rythme cardiaque et du bien-être", "GPS intégré", "Conception résistante à l’eau"] },
      "asus-zenbook": { description: "Écran OLED 3K · Intel Core Ultra 7", features: ["Écran tactile OLED 3K de 14 pouces", "Processeur Intel Core Ultra 7", "Châssis léger en aluminium", "Connectivité USB-C rapide"] },
      "iphone-16": { description: "Puce A18 Pro · stockage 256 Go", features: ["Puce A18 Pro", "Système photo professionnel", "Stockage de 256 Go", "Conception en titane"] },
      "sony-headphones": { description: "Réduction du bruit studio · autonomie de 30 h", features: ["Réduction du bruit parmi les meilleures du marché", "Jusqu’à 30 heures d’autonomie", "Appels mains libres d’une grande clarté", "Confort léger"] },
      "apple-watch": { description: "Écran Retina toujours activé · capteurs de santé", features: ["Conception plus fine et plus légère", "Capteurs de santé avancés", "Écran Retina toujours activé", "Recharge rapide"] },
      "ipad-air": { description: "Puce M3 · écran Liquid Retina de 11 pouces", features: ["Puce Apple M3", "Écran Liquid Retina de 11 pouces", "Compatible avec Apple Pencil", "Autonomie pour toute la journée"] },
      "bose-quietcomfort": { description: "Audio spatial · confort premium", features: ["Audio spatial immersif", "Réduction du bruit de classe mondiale", "Matériaux souples haut de gamme", "Modes d’écoute personnalisés"] },
      "dell-xps": { description: "Écran InfinityEdge · Intel Core Ultra 5", features: ["Écran InfinityEdge de 13,4 pouces", "Intel Core Ultra 5", "Boîtier premium en aluminium usiné", "Compatible ExpressCharge"] },
      "pixel-9": { description: "Google AI · système photo professionnel", features: ["Google AI intégré", "Système photo professionnel à trois capteurs", "Écran Super Actua lumineux", "Sept ans de mises à jour"] },
      "fitbit-sense": { description: "Gestion du stress · autonomie de 6 jours", features: ["Outils de gestion du stress", "ECG et santé cardiaque", "Jusqu’à 6 jours d’autonomie", "GPS intégré"] },
    },
    es: {
      "macbook-pro": { description: "Pantalla Liquid Retina XDR · memoria unificada de 16 GB", features: ["Pantalla Liquid Retina XDR de 14 pulgadas", "Chip Apple M4", "Memoria unificada de 16 GB", "Batería para todo el día"] },
      "galaxy-s25": { description: "Cámara de 200 MP · almacenamiento de 512 GB", features: ["Cámara profesional de 200 MP", "Almacenamiento de 512 GB", "Funciones Galaxy AI", "Pantalla Dynamic AMOLED"] },
      "airpods-pro": { description: "Cancelación activa de ruido · USB-C", features: ["Cancelación activa de ruido", "Audio adaptativo y modo de transparencia", "Estuche de carga MagSafe USB-C", "Audio espacial personalizado"] },
      "galaxy-watch": { description: "Seguimiento avanzado de salud · GPS", features: ["Control avanzado del sueño", "Seguimiento del ritmo cardíaco y bienestar", "GPS integrado", "Diseño resistente al agua"] },
      "asus-zenbook": { description: "Pantalla OLED 3K · Intel Core Ultra 7", features: ["Pantalla táctil OLED 3K de 14 pulgadas", "Procesador Intel Core Ultra 7", "Chasis ligero de aluminio", "Conexión USB-C de alta velocidad"] },
      "iphone-16": { description: "Chip A18 Pro · almacenamiento de 256 GB", features: ["Chip A18 Pro", "Sistema de cámaras Pro", "Almacenamiento de 256 GB", "Diseño de titanio"] },
      "sony-headphones": { description: "Cancelación de ruido de estudio · batería de 30 h", features: ["Cancelación de ruido líder en su categoría", "Hasta 30 horas de batería", "Llamadas manos libres nítidas", "Comodidad y ligereza"] },
      "apple-watch": { description: "Pantalla Retina siempre activa · sensores de salud", features: ["Diseño más fino y ligero", "Sensores de salud avanzados", "Pantalla Retina siempre activa", "Carga rápida"] },
      "ipad-air": { description: "Chip M3 · Liquid Retina de 11 pulgadas", features: ["Chip Apple M3", "Pantalla Liquid Retina de 11 pulgadas", "Compatible con Apple Pencil", "Batería para todo el día"] },
      "bose-quietcomfort": { description: "Audio espacial · comodidad premium", features: ["Audio espacial inmersivo", "Cancelación de ruido de primera", "Materiales suaves de alta calidad", "Modos de escucha personalizados"] },
      "dell-xps": { description: "Pantalla InfinityEdge · Intel Core Ultra 5", features: ["Pantalla InfinityEdge de 13,4 pulgadas", "Intel Core Ultra 5", "Cuerpo premium de aluminio mecanizado", "Compatible con ExpressCharge"] },
      "pixel-9": { description: "Google AI · sistema de cámaras profesional", features: ["Google AI integrado", "Sistema profesional de triple cámara", "Pantalla Super Actua brillante", "Siete años de actualizaciones"] },
      "fitbit-sense": { description: "Gestión del estrés · batería de 6 días", features: ["Herramientas para gestionar el estrés", "ECG y salud cardíaca", "Hasta 6 días de batería", "GPS integrado"] },
    },
    zh: {
      "macbook-pro": { description: "Liquid Retina XDR 显示屏 · 16GB 统一内存", features: ["14 英寸 Liquid Retina XDR 显示屏", "Apple M4 芯片", "16GB 统一内存", "全天续航"] },
      "galaxy-s25": { description: "2 亿像素相机 · 512GB 存储", features: ["2 亿像素专业级相机", "512GB 存储空间", "Galaxy AI 功能", "Dynamic AMOLED 显示屏"] },
      "airpods-pro": { description: "主动降噪 · USB-C", features: ["主动降噪", "自适应音频与通透模式", "USB-C MagSafe 充电盒", "个性化空间音频"] },
      "galaxy-watch": { description: "先进健康追踪 · GPS", features: ["先进睡眠指导", "心率与健康追踪", "内置 GPS", "防水设计"] },
      "asus-zenbook": { description: "3K OLED 显示屏 · Intel Core Ultra 7", features: ["14 英寸 3K OLED 触控屏", "Intel Core Ultra 7 处理器", "轻薄铝合金机身", "高速 USB-C 连接"] },
      "iphone-16": { description: "A18 Pro 芯片 · 256GB 存储", features: ["A18 Pro 芯片", "Pro 专业相机系统", "256GB 存储空间", "钛金属设计"] },
      "sony-headphones": { description: "录音室级降噪 · 30 小时续航", features: ["行业领先的降噪功能", "最长 30 小时续航", "清晰免提通话", "轻盈舒适佩戴"] },
      "apple-watch": { description: "全天候 Retina 显示屏 · 健康传感器", features: ["更薄更轻的设计", "先进健康传感器", "全天候 Retina 显示屏", "快速充电"] },
      "ipad-air": { description: "M3 芯片 · 11 英寸 Liquid Retina 显示屏", features: ["Apple M3 芯片", "11 英寸 Liquid Retina 显示屏", "支持 Apple Pencil", "全天续航"] },
      "bose-quietcomfort": { description: "空间音频 · 高端舒适体验", features: ["沉浸式空间音频", "一流降噪体验", "优质柔软材质", "个性化聆听模式"] },
      "dell-xps": { description: "InfinityEdge 显示屏 · Intel Core Ultra 5", features: ["13.4 英寸 InfinityEdge 显示屏", "Intel Core Ultra 5", "高端 CNC 铝合金机身", "支持 ExpressCharge 快充"] },
      "pixel-9": { description: "Google AI · 专业级相机系统", features: ["内置 Google AI", "专业级三摄系统", "明亮的 Super Actua 屏幕", "七年系统更新"] },
      "fitbit-sense": { description: "压力管理 · 六天续航", features: ["压力管理工具", "心电图与心脏健康监测", "最长六天续航", "内置 GPS"] },
    },
  };
  const localizeProduct = (product, language) => {
    const translation = localizedProductCopy[language]?.[product.id] || {};
    return {
      ...product,
      name: product.name_translations?.[language] || translation.name || product.name,
      description: {
        ...product.description,
        [language]:
          product.description_translations?.[language] ||
          translation.description ||
          product.description[language] ||
          product.description.en,
      },
      features: {
        ...product.features,
        [language]:
          product.localized_features?.[language] ||
          translation.features ||
          product.features[language] ||
          product.features.en,
      },
    };
  };

  async function loadFromSupabase(client) {
    if (!client) return false;
    const { data: productRows, error: productsError } = await client
      .from("products")
      .select("slug, category_slug, brand, name_translations, description_translations, price, compare_at_price, currency, rating, review_count, badge, in_stock, is_active, is_featured, sort_order, external_image_url")
      .eq("is_active", true)
      .order("sort_order", { ascending: false });
    if (productsError) throw productsError;
    if (!productRows?.length) return false;

    const slugs = productRows.map((product) => product.slug);
    const [featureResult, variantResult, imageResult] = await Promise.all([
      client.from("product_features").select("product_slug, language_code, position, content").in("product_slug", slugs).order("position"),
      client.from("product_variants").select("id, variant_key, product_slug, option_group, option_value, option_label_translations, price_adjustment, stock_quantity, sort_order").eq("is_active", true).in("product_slug", slugs).order("sort_order"),
      client.from("product_images").select("product_slug, image_url, storage_path, alt_translations, is_primary, sort_order").in("product_slug", slugs).order("sort_order"),
    ]);
    for (const result of [featureResult, variantResult, imageResult]) {
      if (result.error) throw result.error;
    }

    const featureMap = new Map();
    for (const feature of featureResult.data || []) {
      if (!featureMap.has(feature.product_slug)) featureMap.set(feature.product_slug, {});
      const byLanguage = featureMap.get(feature.product_slug);
      (byLanguage[feature.language_code] ||= []).push(feature);
    }
    const variantsMap = new Map();
    for (const variant of variantResult.data || []) {
      if (!variantsMap.has(variant.product_slug)) variantsMap.set(variant.product_slug, []);
      variantsMap.get(variant.product_slug).push({
        ...variant,
        price_adjustment: Number(variant.price_adjustment) || 0,
      });
    }
    const imagesMap = new Map();
    for (const image of imageResult.data || []) {
      if (!imagesMap.has(image.product_slug)) imagesMap.set(image.product_slug, []);
      imagesMap.get(image.product_slug).push(image);
    }

    const syncedProducts = productRows.map((row) => {
      const imageRows = (imagesMap.get(row.slug) || []).sort(
        (left, right) => Number(right.is_primary) - Number(left.is_primary) || left.sort_order - right.sort_order,
      );
      const firstImage = imageRows[0];
      const image = firstImage?.storage_path
        ? client.storage.from("product-images").getPublicUrl(firstImage.storage_path).data.publicUrl
        : firstImage?.image_url || row.external_image_url || "";
      const localizedFeatures = Object.fromEntries(
        Object.entries(featureMap.get(row.slug) || {}).map(([language, entries]) => [
          language,
          entries.sort((left, right) => left.position - right.position).map((entry) => entry.content),
        ]),
      );
      return {
        id: row.slug,
        slug: row.slug,
        category: row.category_slug,
        brand: row.brand,
        name: row.name_translations?.en || row.slug,
        name_translations: row.name_translations || {},
        description: row.description_translations || {},
        description_translations: row.description_translations || {},
        features: localizedFeatures,
        localized_features: localizedFeatures,
        variants: variantsMap.get(row.slug) || [],
        price: Number(row.price),
        oldPrice: row.compare_at_price === null ? null : Number(row.compare_at_price),
        currency: row.currency || "SAR",
        rating: Number(row.rating) || 0,
        reviews: Number(row.review_count) || 0,
        image,
        badge: row.badge,
        stock: row.in_stock,
        newest: row.sort_order,
        is_active: row.is_active,
        is_featured: row.is_featured,
      };
    });

    products.splice(0, products.length, ...syncedProducts);
    if (window.NoursData) window.NoursData.loaded = true;
    try {
      localStorage.setItem("ruqo-catalog-cache-v1", JSON.stringify(syncedProducts));
    } catch (_) {}
    window.dispatchEvent(new CustomEvent("ruqo:catalog-updated"));
    return true;
  }

  try {
    const cached = localStorage.getItem("ruqo-catalog-cache-v1");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length) {
        products.splice(0, products.length, ...parsed);
      }
    }
  } catch (_) {}

  window.NoursData = { products, localizeProduct, loadFromSupabase, loaded: false };
})();
