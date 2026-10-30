(() => {
  if (document.body.dataset.experimentProduct !== "true" && document.body.dataset.productDesign !== "premium") return;
  const root = document.querySelector("[data-page-root]");
  if (!root) return;

  const copy = {
    en: {
      facts: "At a glance",
      selected: "Your selection",
      top: "Back to product",
      showcaseEyebrow: "FLAGSHIP EXPERIENCE",
      showcaseTitle: "Engineered down to the finest detail.",
      showcaseSub: "Explore the craftsmanship, display brilliance, next-gen performance, and all-day endurance.",
      tabs: [
        { id: "design", icon: "sparkles", label: "Craft & Design", badge: "Aerospace Grade", title: "Precision-crafted unibody that feels effortless.", desc: "Sculpted with clean lines, balanced weight distribution, and a durable anodized finish that resists everyday wear.", statNum: "15.5", statSuffix: "mm", statLabel: "Ultra-thin profile" },
        { id: "display", icon: "monitor", label: "Pro Display", badge: "1,600 nits HDR", title: "True-to-life brilliance from every angle.", desc: "Extreme dynamic range with deep blacks, P3 wide color gamut, and adaptive refresh rate for silky-smooth motion.", statNum: "120", statSuffix: "Hz", statLabel: "Adaptive ProMotion" },
        { id: "performance", icon: "cpu", label: "Next-Gen Chip", badge: "Neural Engine", title: "Desktop-class speed that stays whisper-quiet.", desc: "Render 8K timelines, compile massive projects, and multitask across pro workflows without thermal throttling.", statNum: "3.4", statSuffix: "×", statLabel: "Faster pro workflows" },
        { id: "battery", icon: "battery-charging", label: "All-Day Power", badge: "Fast Charge", title: "Unplugged performance that outlasts your schedule.", desc: "Intelligent power management delivers identical peak speed whether you are plugged in or working on the go.", statNum: "22", statSuffix: "hrs", statLabel: "Continuous playback" },
      ],
      bentoEyebrow: "ARCHITECTURE & BENCHMARKS",
      bentoTitle: "Built to outperform.",
      metersTitle: "Real-world capability index",
      meters: [
        { label: "Multi-Core Compute", score: 96, note: "96% faster than previous generation" },
        { label: "Display Color Accuracy", score: 99, note: "100% P3 wide color · Factory calibrated" },
        { label: "Power Efficiency", score: 94, note: "All-day battery with 50% fast charge in 30 min" },
      ],
      boxTitle: "What’s in the box",
      boxSub: "Everything you need to start right away.",
      boxItems: [
        { icon: "laptop", name: "Main Device", detail: "Factory sealed with protective wrap" },
        { icon: "zap", name: "Fast Power Adapter", detail: "High-efficiency USB-C GaN charger" },
        { icon: "cable", name: "Braided Charge Cable", detail: "2m magnetic / USB-C woven cable" },
        { icon: "shield-check", name: "2-Year Warranty Card", detail: "Official WEEXEY coverage & guide" },
      ],
      faqTitle: "Frequently Asked Questions",
      faqs: [
        { q: "Is this product covered by an official warranty?", a: "Yes. Every device includes a full 2-year WEEXEY warranty covering manufacturing defects and hardware support." },
        { q: "How fast is delivery and can I track my order?", a: "Orders dispatch within 24 hours and arrive in 1–2 business days with live SMS and account tracking." },
        { q: "Can I return or exchange the device if I change my mind?", a: "Absolutely. You have a 7-day return window for sealed or like-new items with all original accessories." },
      ],
    },
    ar: {
      facts: "نظرة سريعة",
      selected: "اختيارك",
      top: "العودة إلى المنتج",
      showcaseEyebrow: "تجربة رائدة",
      showcaseTitle: "صُمم بأدق التفاصيل ليمنحك القوة والأناقة.",
      showcaseSub: "استكشف جودة التصنيع، وإبهار الشاشة، وأداء الجيل الجديد، والبطارية التي تدوم طوال اليوم.",
      tabs: [
        { id: "design", icon: "sparkles", label: "التصميم والمواد", badge: "هيكل فائق المتانة", title: "تصميم متكامل يجمع بين الخفة والفخامة.", desc: "حواف مصقولة بدقة وتوزيع وزن متوازن مع طبقة حماية مقاومة للبصمات والخدوش اليومية.", statNum: "15.5", statSuffix: "مم", statLabel: "سُمك فائق النحافة" },
        { id: "display", icon: "monitor", label: "الشاشة الاحترافية", badge: "سطوع 1600 شمعة", title: "ألوان نابضة بالحياة وتفاصيل فائقة الوضوح.", desc: "نطاق ديناميكي واسع مع تباين عميق وطيف ألوان P3 ومعدل تحديث متكيف لحركة فائقة السلاسة.", statNum: "120", statSuffix: "Hz", statLabel: "معدل تحديث متكيف" },
        { id: "performance", icon: "cpu", label: "الأداء والمعالج", badge: "محرك ذكاء اصطناعي", title: "سرعة فائقة بهدوء تام دون تنازلات.", desc: "شغّل أثقل البرامج والمشاريع الاحترافية وتعدد المهام بكفاءة عالية واستقرار حراري مذهل.", statNum: "3.4", statSuffix: "×", statLabel: "أداء أسرع للمحترفين" },
        { id: "battery", icon: "battery-charging", label: "البطارية والشحن", badge: "شحن فائق السرعة", title: "طاقة ترافقك طوال اليوم بدون توقف.", desc: "إدارة طاقة ذكية تمنحك نفس الأداء الكامل سواء كنت متصلاً بالشاحن أو أثناء التنقل.", statNum: "22", statSuffix: "ساعة", statLabel: "تشغيل متواصل" },
      ],
      bentoEyebrow: "الهندسة ومؤشرات الأداء",
      bentoTitle: "أرقام تتحدث عن القوة.",
      metersTitle: "مؤشر الكفاءة والأداء الفعلي",
      meters: [
        { label: "قوة المعالجة المتعددة", score: 96, note: "أسرع بنسبة 96% مقارنة بالجيل السابق" },
        { label: "دقة الألوان وسطوع الشاشة", score: 99, note: "تغطية 100% لطيف P3 مع معايرة مصنعية" },
        { label: "كفاءة الطاقة والبطارية", score: 94, note: "شحن سريع يصل إلى 50% خلال 30 دقيقة" },
      ],
      boxTitle: "ماذا يوجد في العلبة؟",
      boxSub: "كل ما تحتاجه للانطلاق فور فتح الصندوق.",
      boxItems: [
        { icon: "laptop", name: "الجهاز الرئيسي", detail: "مغلف مصنعياً بغلاف الحماية الأصلي" },
        { icon: "zap", name: "محول طاقة فائق السرعة", detail: "شاحن USB-C عالي الكفاءة" },
        { icon: "cable", name: "كابل شحن مضفور", detail: "كابل متين بطول 2 متر مقاوم للتشابك" },
        { icon: "shield-check", name: "بطاقة ضمان لمدة سنتين", detail: "ضمان WEEXEY الرسمي ودليل البدء السريع" },
      ],
      faqTitle: "الأسئلة الشائعة حول المنتج",
      faqs: [
        { q: "هل يشمل المنتج ضماناً رسمياً؟", a: "نعم، يأتي كل جهاز مع ضمان WEEXEY الرسمي لمدة سنتين يشمل عيوب التصنيع والدعم الفني." },
        { q: "كم يستغرق التوصيل وكيف أتابع طلبي؟", a: "يتم شحن الطلبات خلال 24 ساعة وتصل خلال 1–2 يوم عمل مع تتبع فوري." },
        { q: "هل يمكنني استرجاع أو استبدال المنتج؟", a: "بالتأكيد، لديك 7 أيام للاسترجاع أو الاستبدال بشرط بقاء المنتج بحالته الأصلية مع جميع ملحقاته." },
      ],
    },
    fr: {
      facts: "En un coup d’œil",
      selected: "Votre sélection",
      top: "Retour au produit",
      showcaseEyebrow: "EXPÉRIENCE PHARE",
      showcaseTitle: "Conçu dans les moindres détails.",
      showcaseSub: "Découvrez le design, l’éclat de l’écran, la puissance de nouvelle génération et l’autonomie longue durée.",
      tabs: [
        { id: "design", icon: "sparkles", label: "Design & Finition", badge: "Châssis Premium", title: "Un boîtier monobloc alliant finesse et robustesse.", desc: "Des lignes épurées, un équilibre parfait et une finition anodisée résistante aux traces.", statNum: "15.5", statSuffix: "mm", statLabel: "Profil ultra-fin" },
        { id: "display", icon: "monitor", label: "Écran Pro", badge: "1 600 nits HDR", title: "Une clarté spectaculaire sous tous les angles.", desc: "Plage dynamique extrême, couleurs P3 et taux de rafraîchissement adaptatif.", statNum: "120", statSuffix: "Hz", statLabel: "Fluidité ProMotion" },
        { id: "performance", icon: "cpu", label: "Puce Nouvelle Gén.", badge: "Moteur Neural", title: "Une vitesse fulgurante dans un silence absolu.", desc: "Montage haute résolution et multitâche intensif sans ralentissement.", statNum: "3.4", statSuffix: "×", statLabel: "Plus rapide" },
        { id: "battery", icon: "battery-charging", label: "Autonomie", badge: "Charge Rapide", title: "Une endurance qui suit votre rythme toute la journée.", desc: "Gestion intelligente de l’énergie pour des performances maximales même sur batterie.", statNum: "22", statSuffix: "h", statLabel: "Lecture continue" },
      ],
      bentoEyebrow: "ARCHITECTURE & PERFORMANCES",
      bentoTitle: "Conçu pour surpasser.",
      metersTitle: "Indice de performance réelle",
      meters: [
        { label: "Puissance de calcul", score: 96, note: "96 % plus rapide que la génération précédente" },
        { label: "Précision des couleurs", score: 99, note: "Gamme P3 complète calibrée en usine" },
        { label: "Efficacité énergétique", score: 94, note: "Charge rapide à 50 % en 30 minutes" },
      ],
      boxTitle: "Contenu du coffret",
      boxSub: "Tout le nécessaire dès l’ouverture.",
      boxItems: [
        { icon: "laptop", name: "Appareil principal", detail: "Scellé en usine avec protection" },
        { icon: "zap", name: "Adaptateur secteur rapide", detail: "Chargeur USB-C haute efficacité" },
        { icon: "cable", name: "Câble tressé", detail: "Câble haute résistance de 2 m" },
        { icon: "shield-check", name: "Garantie 2 ans", detail: "Couverture officielle WEEXEY" },
      ],
      faqTitle: "Questions fréquentes",
      faqs: [
        { q: "Ce produit bénéficie-t-il d’une garantie officielle ?", a: "Oui, chaque appareil inclut une garantie officielle WEEXEY de 2 ans." },
        { q: "Quels sont les délais de livraison ?", a: "Expédition sous 24 h et livraison en 1 à 2 jours ouvrés avec suivi." },
        { q: "Puis-je retourner ou échanger le produit ?", a: "Oui, vous disposez de 7 jours pour retourner un article dans son état d’origine." },
      ],
    },
    es: {
      facts: "De un vistazo",
      selected: "Tu selección",
      top: "Volver al producto",
      showcaseEyebrow: "EXPERIENCIA INSIGNIA",
      showcaseTitle: "Diseñado hasta el último detalle.",
      showcaseSub: "Explora el diseño artesanal, el brillo de pantalla, el rendimiento de última generación y la batería para todo el día.",
      tabs: [
        { id: "design", icon: "sparkles", label: "Diseño y Acabado", badge: "Grado Aeroespacial", title: "Cuerpo unibody de precisión ligero y resistente.", desc: "Líneas limpias, peso equilibrado y acabado anodizado duradero.", statNum: "15.5", statSuffix: "mm", statLabel: "Perfil ultradelgado" },
        { id: "display", icon: "monitor", label: "Pantalla Pro", badge: "1,600 nits HDR", title: "Brillo realista desde cualquier ángulo.", desc: "Alto rango dinámico, negros profundos, gama P3 y refresco adaptativo.", statNum: "120", statSuffix: "Hz", statLabel: "Refresco adaptativo" },
        { id: "performance", icon: "cpu", label: "Chip de Nueva Gen.", badge: "Motor Neuronal", title: "Velocidad profesional y silenciosa.", desc: "Edita vídeo pesado y ejecuta multitarea exigente sin esfuerzo.", statNum: "3.4", statSuffix: "×", statLabel: "Más rápido" },
        { id: "battery", icon: "battery-charging", label: "Batería Todo el Día", badge: "Carga Rápida", title: "Potencia sin cables durante toda tu jornada.", desc: "Rendimiento máximo constante conectado o en movilidad.", statNum: "22", statSuffix: "h", statLabel: "Autonomía continua" },
      ],
      bentoEyebrow: "ARQUITECTURA Y RENDIMIENTO",
      bentoTitle: "Creado para superar límites.",
      metersTitle: "Índice de capacidad real",
      meters: [
        { label: "Potencia multinúcleo", score: 96, note: "96 % más rápido que la generación anterior" },
        { label: "Precisión de color", score: 99, note: "100 % gama P3 calibrada de fábrica" },
        { label: "Eficiencia energética", score: 94, note: "Carga rápida al 50 % en 30 minutos" },
      ],
      boxTitle: "Contenido de la caja",
      boxSub: "Todo listo para empezar desde el primer minuto.",
      boxItems: [
        { icon: "laptop", name: "Dispositivo principal", detail: "Sellado de fábrica con protección" },
        { icon: "zap", name: "Adaptador de carga rápida", detail: "Cargador USB-C de alta eficiencia" },
        { icon: "cable", name: "Cable trenzado", detail: "Cable resistente de 2 metros" },
        { icon: "shield-check", name: "Garantía de 2 años", detail: "Cobertura oficial WEEXEY" },
      ],
      faqTitle: "Preguntas frecuentes",
      faqs: [
        { q: "¿Incluye garantía oficial?", a: "Sí, todos los productos cuentan con 2 años de garantía oficial WEEXEY." },
        { q: "¿Cuánto tarda el envío?", a: "Entrega rápida en 1–2 días laborables con seguimiento en tiempo real." },
        { q: "¿Puedo devolver el producto?", a: "Sí, dispones de 7 días para devoluciones con todos los accesorios originales." },
      ],
    },
    zh: {
      facts: "一览要点",
      selected: "已选配置",
      top: "返回商品",
      showcaseEyebrow: "旗舰级体验",
      showcaseTitle: "精雕细琢，实力非凡。",
      showcaseSub: "探索精湛工艺、绚丽屏幕、新一代芯片性能与全天候续航表现。",
      tabs: [
        { id: "design", icon: "sparkles", label: "工艺与设计", badge: "航空级材质", title: "精密一体成型机身，轻盈且坚固。", desc: "利落线条与均衡配重，抗指纹阳极氧化表面持久如新。", statNum: "15.5", statSuffix: "mm", statLabel: "纤薄机身" },
        { id: "display", icon: "monitor", label: "专业显示屏", badge: "1600 尼特 HDR", title: "高动态范围，每一帧都栩栩如生。", desc: "深邃暗部、P3 广色域与自适应高刷新率带来丝滑视觉。", statNum: "120", statSuffix: "Hz", statLabel: "自适应高刷" },
        { id: "performance", icon: "cpu", label: "新一代芯片", badge: "神经网络引擎", title: "桌面级强劲性能，依然静谧冷静。", desc: "轻松应对高负载创作与多任务处理。", statNum: "3.4", statSuffix: "×", statLabel: "专业性能提升" },
        { id: "battery", icon: "battery-charging", label: "全天候续航", badge: "快速充电", title: "持久电力，全天随行无忧。", desc: "智能电源管理让离电状态同样保持巅峰速度。", statNum: "22", statSuffix: "小时", statLabel: "持久续航" },
      ],
      bentoEyebrow: "架构与性能指标",
      bentoTitle: "为超越而生。",
      metersTitle: "综合性能指数",
      meters: [
        { label: "多核计算性能", score: 96, note: "相比上一代提升 96%" },
        { label: "色彩精准度与亮度", score: 99, note: "100% P3 广色域 · 出厂校色" },
        { label: "能效与快充表现", score: 94, note: "30 分钟可充至 50% 电量" },
      ],
      boxTitle: "包装盒内容",
      boxSub: "开箱即享完整配件。",
      boxItems: [
        { icon: "laptop", name: "主机设备", detail: "原厂密封包装" },
        { icon: "zap", name: "快速电源适配器", detail: "高效 USB-C 充电器" },
        { icon: "cable", name: "编织充电线", detail: "2 米耐用编织线材" },
        { icon: "shield-check", name: "2 年官方保修卡", detail: "WEEXEY 官方质保与指南" },
      ],
      faqTitle: "常见问题解答",
      faqs: [
        { q: "是否提供官方保修？", a: "是的，每台设备均享 2 年 WEEXEY 官方质保服务。" },
        { q: "发货与配送需要多久？", a: "24 小时内发货，1–2 个工作日送达并支持实时追踪。" },
        { q: "支持退换货吗？", a: "支持 7 天无理由退换（保持原包装及配件齐全）。" },
      ],
    },
  };
  const iconRules = [
    [/display|screen|شاشة|écran|pantalla|屏/i, "monitor"],
    [/camera|كاميرا|caméra|cámara|相机|摄像/i, "camera"],
    [/batter|بطارية|batería|电池|续航/i, "battery-charging"],
    [/dimension|weight|size|الأبعاد|الوزن|poids|peso|尺寸|重量/i, "ruler"],
    [/chip|processor|cpu|معالج|processeur|procesador|芯片|处理器/i, "cpu"],
    [/storage|memory|ram|ssd|تخزين|ذاكرة|stockage|mémoire|almacenamiento|memoria|存储|内存/i, "hard-drive"],
    [/port|connect|wi-?fi|bluetooth|منافذ|اتصال|puertos|conexi|接口|连接/i, "plug-zap"],
    [/sound|audio|صوت|son|sonido|音/i, "audio-lines"],
  ];
  const deepDiveData = {
    en: {
      explore: "Deep dive",
      close: "Close details",
      prev: "Previous feature",
      next: "Next feature",
      highlightsLabel: "Engineering highlights",
      specsLabel: "Specialized metrics",
      cards: {
        design: {
          kicker: "AEROSPACE UNIBODY ARCHITECTURE",
          story: "Machined from a single block of high-grade recycled aluminum, the enclosure achieves extraordinary structural rigidity while staying feather-light. A micro-blasted anodized seal repels fingerprints, and laser-cut acoustic vents blend invisibly into the hinge.",
          metrics: [
            { value: "100%", label: "Recycled aerospace aluminum" },
            { value: "15.5mm", label: "Precision thin profile" },
            { value: "3×", label: "Anodized scratch resistance" },
          ],
          bullets: [
            "CNC-milled unibody chassis eliminates flex and creaks under heavy travel.",
            "Force-balanced hinge opens smoothly with a single finger and holds any angle.",
            "Thermal-conductive bottom plate dissipates heat silently without fan noise.",
          ],
        },
        display: {
          kicker: "EXTREME DYNAMIC RANGE DISPLAY",
          story: "Over 10,000 mini-LEDs grouped into individually controlled local dimming zones deliver reference-grade contrast. Whether grading HDR cinema or working under direct sunlight, colors stay razor-sharp and true to life.",
          metrics: [
            { value: "1,600 nits", label: "Peak HDR brightness" },
            { value: "1,000,000:1", label: "True contrast ratio" },
            { value: "120Hz", label: "ProMotion adaptive refresh" },
          ],
          bullets: [
            "10-bit P3 wide color depth reveals over a billion subtle color gradations.",
            "Adaptive refresh dynamically scales from 24Hz to 120Hz to match your content.",
            "Anti-reflective optical coating cuts glare by 75% in bright studio lighting.",
          ],
        },
        performance: {
          kicker: "NEXT-GENERATION SILICON & NEURAL ENGINE",
          story: "Built on a second-generation 3-nanometer process, the unified architecture pairs high-bandwidth memory directly with the CPU, GPU, and 16-core Neural Engine—turning complex 3D rendering, AI models, and code compilation into instant tasks.",
          metrics: [
            { value: "3.4×", label: "Faster 3D & pro rendering" },
            { value: "38 TOPS", label: "Dedicated AI Neural Engine" },
            { value: "400GB/s", label: "Unified memory bandwidth" },
          ],
          bullets: [
            "Hardware-accelerated ray tracing and mesh shading for studio-grade 3D graphics.",
            "Zero-throttle thermal envelope keeps sustained performance identical on battery.",
            "Dedicated media engines handle multiple streams of 8K ProRes video effortlessly.",
          ],
        },
        battery: {
          kicker: "INTELLIGENT ALL-DAY POWER SYSTEM",
          story: "High-density cobalt-optimized battery cells work in concert with silicon-level power gating. Idle cores sleep in microseconds, stretching a single charge across transcontinental flights and full workdays.",
          metrics: [
            { value: "22 hrs", label: "Continuous video & work" },
            { value: "50%", label: "Fast charge in 30 minutes" },
            { value: "1,000+", label: "Full charge health cycles" },
          ],
          bullets: [
            "Smart adaptive charging learns your daily routine to preserve long-term cell health.",
            "Magnetic quick-release and universal USB-C Power Delivery charging support.",
            "Unplugged peak performance—zero speed drop when disconnected from power.",
          ],
        },
      },
    },
    ar: {
      explore: "اكتشف التخصص",
      close: "إغلاق النافذة",
      prev: "الميزة السابقة",
      next: "الميزة التالية",
      highlightsLabel: "أبرز الابتكارات الهندسية",
      specsLabel: "الأرقام التخصصية الدقيقة",
      cards: {
        design: {
          kicker: "هندسة الهيكل المعدني المتكامل",
          story: "صُنع الهيكل من قطعة واحدة من ألمنيوم الطائرات الفاخر ليمنحك صلابة استثنائية مع وزن خفيف وملمس حريري. كما تمت معالجة السطح بطبقة مؤكسدة دقيقة تقاوم البصمات والخدوش اليومية بكفاءة عالية.",
          metrics: [
            { value: "100%", label: "ألمنيوم فائق النقاء" },
            { value: "15.5 مم", label: "نحافة هندسية متوازنة" },
            { value: "3×", label: "مقاومة أعلى للخدوش" },
          ],
          bullets: [
            "تصنيع CNC متكامل يمنع أي انحناء أو اهتزاز أثناء التنقل والعمل المكثف.",
            "مفصل متوازن يفتح بإصبع واحد بسلاسة ويثبت الشاشة عند أي زاوية بدقة.",
            "توزيع حراري ذكي عبر الهيكل يحافظ على برودة الجهاز وهدوئه التام.",
          ],
        },
        display: {
          kicker: "شاشة النطاق الديناميكي الفائق XDR",
          story: "أكثر من 10,000 وحدة إضاءة دقيقة تتحكم في التعتيم المحلي لإنتاج لون أسود عميق وسطوع مبهر. سواء كنت تصمم محتوى سينمائياً أو تعمل تحت إضاءة قوية، ستشاهد ألواناً واقعية من كل زاوية.",
          metrics: [
            { value: "1600 شمعة", label: "أقصى سطوع HDR" },
            { value: "1,000,000:1", label: "نسبة التباين الحقيقي" },
            { value: "120Hz", label: "تحديث متكيف ProMotion" },
          ],
          bullets: [
            "عمق لوني P3 يعرض أكثر من مليار درجة لونية بدقة معايرة المصنع.",
            "معدل تحديث ذكي يتكيف تلقائياً من 24Hz إلى 120Hz حسب حركة المحتوى.",
            "طبقة بصرية مضادة للانعكاس تقلل التوهج بنسبة 75% لراحة العين.",
          ],
        },
        performance: {
          kicker: "شريحة الجيل الجديد ومحرك الذكاء الاصطناعي",
          story: "معمارية متطورة بدقة 3 نانومتر تدمج المعالج الرئيسي ومعالج الرسوميات والذاكرة الموحدة فائقة السرعة في شريحة واحدة، لتحويل الرندرة ثلاثية الأبعاد والبرمجة والمونتاج الثقيل إلى مهام فورية.",
          metrics: [
            { value: "3.4×", label: "سرعة معالجة ورندرة أعلى" },
            { value: "38 TOPS", label: "قوة محرك الذكاء الاصطناعي" },
            { value: "400GB/s", label: "نطاق الذاكرة الموحدة" },
          ],
          bullets: [
            "تتبع أشعة مسرّع بالعتاد لرسوميات ثلاثية الأبعاد فائقة الواقعية.",
            "ثبات كامل في الأداء الأقصى دون هبوط في السرعة مع ضغط العمل الطويل.",
            "محركات وسائط مخصصة لتشغيل وتحرير عدة مسارات فيديو 8K في وقت واحد.",
          ],
        },
        battery: {
          kicker: "منظومة الطاقة الذكية طوال اليوم",
          story: "خلايا بطارية عالية الكثافة تعمل بتناغم مع إدارة الطاقة في المعالج، حيث تتوقف الأنوية غير النشطة خلال أجزاء من الألف من الثانية لتمنحك يوماً كاملاً من العمل المتواصل بشحنة واحدة.",
          metrics: [
            { value: "22 ساعة", label: "تشغيل وعمل متواصل" },
            { value: "50%", label: "شحن سريع خلال 30 دقيقة" },
            { value: "1000+", label: "دورة شحن بعمر طويل" },
          ],
          bullets: [
            "شحن ذكي يتعلم نمط استخدامك اليومي للحفاظ على صحة البطارية لسنوات.",
            "دعم الشحن المغناطيسي السريع أو عبر منافذ USB-C الشاملة.",
            "نفس السرعة القصوى الكاملة سواء كان الجهاز متصلاً بالشاحن أو على البطارية.",
          ],
        },
      },
    },
  };
  const getDeepDive = () => {
    const lang = (document.documentElement.lang || "en").split("-")[0];
    return deepDiveData[lang] || deepDiveData.en;
  };
  const text = () => copy[(document.documentElement.lang || "en").split("-")[0]] || copy.en;
  const icon = (name) => {
    const node = document.createElement("i");
    node.dataset.expIcon = name;
    node.setAttribute("aria-hidden", "true");
    return node;
  };
  const refreshIcons = () => {
    if (window.lucide?.icons && root.querySelector("i[data-exp-icon]")) {
      window.lucide.createIcons({ icons: window.lucide.icons, nameAttr: "data-exp-icon" });
    }
  };

  function buildFacts(page) {
    const description = page.querySelector(".detail-description");
    if (!description || description.dataset.expFacts) return;
    const items = description.textContent.split(/\n|(?=•)/).map((line) => line.replace(/^\s*[•\-–]\s*/, "").trim()).filter(Boolean)
      .map((line) => {
        const split = line.indexOf(":");
        return split > 0 && split < 48 ? { label: line.slice(0, split).trim(), value: line.slice(split + 1).trim() } : null;
      });
    description.dataset.expFacts = "checked";
    if (items.length < 2 || items.some((item) => !item?.value)) return;
    const section = document.createElement("section");
    section.className = "exp-key-facts";
    const heading = document.createElement("h2");
    heading.textContent = text().facts;
    const list = document.createElement("dl");
    items.forEach((item) => {
      const card = document.createElement("div");
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      const rule = iconRules.find(([pattern]) => pattern.test(item.label));
      term.append(icon(rule ? rule[1] : "sparkles"), document.createTextNode(item.label));
      detail.textContent = item.value;
      card.append(term, detail);
      list.append(card);
    });
    section.append(heading, list);
    description.dataset.expFacts = "built";
    description.after(section);
  }

  function selectionSummary(page) {
    return [...page.querySelectorAll(".product-variant-picker")].map((picker) =>
      picker.querySelector(".product-variant-option.is-selected")?.textContent.trim()).filter(Boolean).join(" · ");
  }

  function buildSummary(page) {
    const config = page.querySelector(".product-buy-config");
    if (!config) return;
    let summary = page.querySelector(".exp-selection-summary");
    if (!summary) {
      summary = document.createElement("p");
      summary.className = "exp-selection-summary";
      summary.setAttribute("aria-live", "polite");
      summary.append(document.createElement("span"), document.createElement("strong"));
      config.append(summary);
    }
    const value = selectionSummary(page);
    const setText = (node, next) => { if (node.textContent !== next) node.textContent = next; };
    if (summary.hidden !== !value) summary.hidden = !value;
    setText(summary.firstChild, text().selected);
    setText(summary.lastChild, value);
  }

  let bar, barObserver, priceObserver;
  function buildBar(page) {
    const add = page.querySelector(".product-purchase-row .detail-add-button");
    const row = page.querySelector(".product-purchase-row");
    if (!add || !row) return;
    if (!bar) {
      bar = document.createElement("aside");
      bar.className = "exp-buy-bar";
      bar.setAttribute("aria-label", document.querySelector("h1")?.textContent || "");
      bar.innerHTML = `<button type="button" class="exp-buy-bar-product"><img alt="" /><span><strong></strong><small></small></span></button><span class="exp-buy-bar-price"></span><button type="button" class="exp-buy-bar-add"></button>`;
      document.body.append(bar);
      bar.querySelector(".exp-buy-bar-add").addEventListener("click", () => {
        root.querySelector(".product-purchase-row .detail-add-button")?.click();
      });
      bar.querySelector(".exp-buy-bar-product").addEventListener("click", () => {
        const target = root.querySelector(".product-detail-copy h1");
        target?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      });
    }
    const sync = () => {
      const current = root.querySelector(".product-purchase-row .detail-add-button");
      if (!current) return;
      const set = (node, property, value) => { if (node[property] !== value) node[property] = value; };
      const mainImage = root.querySelector("[data-detail-image]");
      set(bar.querySelector("img"), "src", mainImage?.currentSrc || mainImage?.src || "");
      set(bar.querySelector("strong"), "textContent", root.querySelector(".product-detail-copy h1")?.textContent || "");
      set(bar.querySelector("small"), "textContent", selectionSummary(root));
      set(bar.querySelector(".exp-buy-bar-price"), "textContent", root.querySelector(".product-detail-price strong")?.textContent || "");
      const proxy = bar.querySelector(".exp-buy-bar-add");
      if (proxy.innerHTML !== current.innerHTML) proxy.innerHTML = current.innerHTML;
      set(proxy, "disabled", current.disabled);
      bar.querySelector(".exp-buy-bar-product").setAttribute("aria-label", text().top);
    };
    sync();
    bar.sync = sync;
    barObserver?.disconnect();
    barObserver = new IntersectionObserver(([entry]) => {
      const passed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      bar.classList.toggle("is-visible", passed);
      bar.inert = !passed;
    });
    barObserver.observe(row);
    priceObserver?.disconnect();
    priceObserver = new MutationObserver(() => requestAnimationFrame(() => { buildSummary(root); sync(); }));
    priceObserver.observe(page.querySelector(".product-detail-copy"), { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["class", "disabled", "aria-checked"] });
    page.querySelector("[data-detail-image]")?.addEventListener("load", sync);
  }

  function sampleGlow(page) {
    const image = page.querySelector("[data-detail-image]");
    if (!image?.src || page.dataset.expGlowSource === image.src) return;
    page.dataset.expGlowSource = image.src;
    const probe = new Image();
    probe.crossOrigin = "anonymous";
    probe.decoding = "async";
    probe.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 24;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(probe, 0, 0, 24, 24);
        const data = context.getImageData(0, 0, 24, 24).data;
        let red = 0, green = 0, blue = 0, weight = 0;
        for (let index = 0; index < data.length; index += 4) {
          const max = Math.max(data[index], data[index + 1], data[index + 2]);
          const min = Math.min(data[index], data[index + 1], data[index + 2]);
          // Favour saturated pixels so white studio backgrounds do not wash the glow out.
          const saturation = max ? (max - min) / max : 0;
          const amount = (saturation + 0.08) * (data[index + 3] / 255);
          red += data[index] * amount; green += data[index + 1] * amount; blue += data[index + 2] * amount; weight += amount;
        }
        if (weight) page.style.setProperty("--exp-glow", `rgb(${Math.round(red / weight)} ${Math.round(green / weight)} ${Math.round(blue / weight)})`);
      } catch (error) {
        console.warn("Product glow colour unavailable; using the brand colour.", error.message);
      }
    };
    probe.onerror = () => console.warn("Product glow image could not be sampled; using the brand colour.");
    probe.src = image.src;
  }

  function currentProductImages(page) {
    const slug = new URLSearchParams(location.search).get("id") || "macbook-pro";
    const catalogProduct = window.NoursData?.products?.find((item) => (item.slug || item.id) === slug);
    const urls = [];
    const add = (url) => {
      if (url && typeof url === "string" && !urls.includes(url)) urls.push(url);
    };
    add(page.querySelector("[data-detail-image]")?.src);
    page.querySelectorAll(".product-gallery-thumb img").forEach((img) => add(img.src));
    (catalogProduct?.images || []).forEach(add);
    (catalogProduct?.detailImages || []).forEach(add);
    add("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=85");
    add("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1400&q=85");
    return urls;
  }

  function attachSpotlightTilt(element) {
    if (!element || element.dataset.expTiltBound) return;
    element.dataset.expTiltBound = "true";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    element.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch" || reduced.matches) return;
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      element.style.setProperty("--spot-x", `${(x * 100).toFixed(1)}%`);
      element.style.setProperty("--spot-y", `${(y * 100).toFixed(1)}%`);
      element.style.setProperty("--card-rx", `${((0.5 - y) * 5).toFixed(2)}deg`);
      element.style.setProperty("--card-ry", `${((x - 0.5) * 6).toFixed(2)}deg`);
    });
    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--card-rx", "0deg");
      element.style.setProperty("--card-ry", "0deg");
    });
  }

  function buildFlagshipShowcase(page, anchor) {
    let showcase = root.querySelector(".exp-flagship-showcase");
    if (showcase) return showcase;

    const t = text();
    const images = currentProductImages(page);
    const slug = new URLSearchParams(location.search).get("id") || "macbook-pro";
    const lang = (document.documentElement.lang || "en").split("-")[0];
    const rawProduct = window.NoursData?.products?.find((item) => (item.slug || item.id) === slug);
    const localizedProduct = rawProduct && window.NoursData?.localizeProduct
      ? window.NoursData.localizeProduct(rawProduct, lang)
      : rawProduct;
    const productFeatures = Array.isArray(localizedProduct?.features?.[lang]) && localizedProduct.features[lang].length
      ? localizedProduct.features[lang]
      : Array.isArray(localizedProduct?.features?.en) ? localizedProduct.features.en : [];
    const productSpecs = Array.isArray(localizedProduct?.specifications?.[lang]) && localizedProduct.specifications[lang].length
      ? localizedProduct.specifications[lang]
      : Array.isArray(localizedProduct?.specifications?.en) ? localizedProduct.specifications.en : [];
    const customShowcase = rawProduct?.product_option_values?._showcase || {};
    const resolveTabCopy = (tab) => {
      const custom = customShowcase[tab.id];
      if (!custom || typeof custom !== "object") {
        return {
          badge: tab.badge,
          title: tab.title,
          desc: tab.desc,
          stat: `${tab.statNum}${tab.statSuffix}`,
          statLabel: tab.statLabel,
        };
      }
      const trans = custom.translations?.[lang] || custom.translations?.en || custom.source || {};
      const enSource = custom.translations?.en || custom.source || {};
      return {
        badge: tab.badge,
        title: (trans.title || enSource.title || "").trim() || tab.title,
        desc: (trans.desc || enSource.desc || "").trim() || tab.desc,
        stat: String(custom.stat || "").trim() || `${tab.statNum}${tab.statSuffix}`,
        statLabel: (trans.label || enSource.label || "").trim() || tab.statLabel,
      };
    };

    showcase = document.createElement("section");
    showcase.className = "exp-flagship-showcase";
    showcase.innerHTML = `
      <header class="exp-showcase-header exp-reveal">
        <span class="exp-showcase-eyebrow"></span>
        <h2 class="exp-showcase-title"></h2>
        <p class="exp-showcase-sub"></p>
      </header>

      <div class="exp-interactive-studio exp-reveal">
        <div class="exp-studio-tabs" role="tablist"></div>
        <div class="exp-studio-stage">
          <div class="exp-studio-copy">
            <span class="exp-studio-badge"></span>
            <h3 class="exp-studio-heading"></h3>
            <p class="exp-studio-desc"></p>
            <div class="exp-studio-stat">
              <strong class="exp-studio-stat-num"></strong>
              <span class="exp-studio-stat-label"></span>
            </div>
          </div>
          <div class="exp-studio-visual">
            <div class="exp-studio-frame">
              <img class="exp-studio-img" alt="" loading="lazy" />
              <div class="exp-studio-SpecPill"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="exp-bento-section exp-reveal">
        <div class="exp-bento-grid"></div>
      </div>

      <div class="exp-performance-cinema exp-reveal">
        <div class="exp-meters-card">
          <span class="exp-showcase-eyebrow"></span>
          <h3 class="exp-meters-title"></h3>
          <div class="exp-meters-list"></div>
        </div>
        <div class="exp-box-card">
          <h3 class="exp-box-title"></h3>
          <p class="exp-box-sub"></p>
          <div class="exp-box-grid"></div>
        </div>
      </div>

      <div class="exp-faq-section exp-reveal">
        <h3 class="exp-faq-title"></h3>
        <div class="exp-faq-list"></div>
      </div>
    `;

    showcase.querySelector(".exp-showcase-eyebrow").textContent = t.showcaseEyebrow;
    showcase.querySelector(".exp-showcase-title").textContent = t.showcaseTitle;
    showcase.querySelector(".exp-showcase-sub").textContent = t.showcaseSub;

    // 1. Interactive Studio Tabs
    const tabList = showcase.querySelector(".exp-studio-tabs");
    const badgeEl = showcase.querySelector(".exp-studio-badge");
    const headingEl = showcase.querySelector(".exp-studio-heading");
    const descEl = showcase.querySelector(".exp-studio-desc");
    const statNumEl = showcase.querySelector(".exp-studio-stat-num");
    const statLabelEl = showcase.querySelector(".exp-studio-stat-label");
    const studioImg = showcase.querySelector(".exp-studio-img");
    const studioPill = showcase.querySelector(".exp-studio-SpecPill");
    const studioStage = showcase.querySelector(".exp-studio-stage");
    attachSpotlightTilt(studioStage);

    let activeTabIndex = 0;
    const selectTab = (index, animate = true) => {
      activeTabIndex = index;
      const tabData = t.tabs[index] || t.tabs[0];
      const featureOverride = productFeatures[index];
      const specOverride = productSpecs[index];

      [...tabList.children].forEach((btn, idx) => {
        const selected = idx === index;
        btn.classList.toggle("is-active", selected);
        btn.setAttribute("aria-selected", String(selected));
      });

      const resolved = resolveTabCopy(tabData);
      badgeEl.textContent = resolved.badge;
      headingEl.textContent = resolved.title;
      descEl.textContent = resolved.desc;
      statNumEl.textContent = resolved.stat;
      statLabelEl.textContent = resolved.statLabel;
      studioPill.textContent = `${localizedProduct?.name || "WEEXEY Pro"} · ${tabData.label}`;

      const nextImg = images[index % images.length] || images[0];
      studioImg.src = nextImg;
      studioImg.alt = headingEl.textContent;
      studioStage.dataset.visualMode = tabData.id;

      if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        studioStage.querySelector(".exp-studio-copy").animate(
          [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 380, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
        studioImg.animate(
          [{ opacity: 0.3, transform: "scale(0.94) rotate(-1deg)" }, { opacity: 1, transform: "scale(1) rotate(0deg)" }],
          { duration: 460, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
      }
    };

    t.tabs.forEach((tab, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.role = "tab";
      btn.className = "exp-studio-tab";
      btn.append(icon(tab.icon), document.createTextNode(tab.label));
      btn.addEventListener("click", () => selectTab(idx, true));
      tabList.append(btn);
    });
    selectTab(0, false);

    // 2. Bento Grid (4 visual feature cards with images & specialized deep-dive modal)
    const bentoGrid = showcase.querySelector(".exp-bento-grid");
    const dd = getDeepDive();

    let modal = document.querySelector(".exp-bento-modal");
    if (!modal) {
      modal = document.createElement("dialog");
      modal.className = "exp-bento-modal";
      document.body.append(modal);
      modal.addEventListener("click", (event) => {
        if (event.target === modal) modal.close();
      });
    }
    modal.innerHTML = `
      <div class="exp-bento-modal-shell">
        <header class="exp-bento-modal-top">
          <div class="exp-bento-modal-pills" role="tablist"></div>
          <button type="button" class="exp-bento-modal-close" aria-label="${dd.close}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
          </button>
        </header>
        <div class="exp-bento-modal-body">
          <div class="exp-bento-modal-visual">
            <img class="exp-bento-modal-img" alt="" />
            <div class="exp-bento-modal-caption">
              <span class="exp-bento-modal-badge"></span>
              <strong class="exp-bento-modal-product"></strong>
            </div>
          </div>
          <div class="exp-bento-modal-copy">
            <span class="exp-bento-modal-kicker"></span>
            <h3 class="exp-bento-modal-title"></h3>
            <p class="exp-bento-modal-story"></p>
            <div class="exp-bento-modal-section">
              <h4 class="exp-bento-modal-subhead" data-dd-specs-head></h4>
              <div class="exp-bento-modal-metrics"></div>
            </div>
            <div class="exp-bento-modal-section">
              <h4 class="exp-bento-modal-subhead" data-dd-highlights-head></h4>
              <ul class="exp-bento-modal-bullets"></ul>
            </div>
          </div>
        </div>
        <footer class="exp-bento-modal-footer">
          <button type="button" class="exp-bento-modal-nav" data-dd-prev>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span></span>
          </button>
          <span class="exp-bento-modal-counter" dir="ltr"></span>
          <button type="button" class="exp-bento-modal-nav" data-dd-next>
            <span></span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </footer>
      </div>
    `;

    const modalPills = modal.querySelector(".exp-bento-modal-pills");
    const modalImg = modal.querySelector(".exp-bento-modal-img");
    const modalBadge = modal.querySelector(".exp-bento-modal-badge");
    const modalProduct = modal.querySelector(".exp-bento-modal-product");
    const modalKicker = modal.querySelector(".exp-bento-modal-kicker");
    const modalTitle = modal.querySelector(".exp-bento-modal-title");
    const modalStory = modal.querySelector(".exp-bento-modal-story");
    const modalMetrics = modal.querySelector(".exp-bento-modal-metrics");
    const modalBullets = modal.querySelector(".exp-bento-modal-bullets");
    const modalCounter = modal.querySelector(".exp-bento-modal-counter");
    const prevBtn = modal.querySelector("[data-dd-prev]");
    const nextBtn = modal.querySelector("[data-dd-next]");
    modal.querySelector("[data-dd-specs-head]").textContent = dd.specsLabel;
    modal.querySelector("[data-dd-highlights-head]").textContent = dd.highlightsLabel;
    prevBtn.querySelector("span").textContent = dd.prev;
    nextBtn.querySelector("span").textContent = dd.next;
    modal.querySelector(".exp-bento-modal-close").addEventListener("click", () => modal.close());

    let modalIndex = 0;
    const renderModalSlide = (idx, animate = true) => {
      modalIndex = ((idx % t.tabs.length) + t.tabs.length) % t.tabs.length;
      const tab = t.tabs[modalIndex];
      const specInfo = dd.cards[tab.id] || dd.cards.design;
      const imgUrl = images[(modalIndex + 1) % images.length] || images[0];
      const featureHeadline = productFeatures[modalIndex] || tab.title;
      const productSpecRow = productSpecs[modalIndex];

      [...modalPills.children].forEach((pill, pillIdx) => {
        const active = pillIdx === modalIndex;
        pill.classList.toggle("is-active", active);
        pill.setAttribute("aria-selected", String(active));
      });

      const resolved = resolveTabCopy(tab);
      modalImg.src = imgUrl;
      modalImg.alt = resolved.title;
      modalBadge.textContent = resolved.badge;
      modalProduct.textContent = `${localizedProduct?.name || "WEEXEY"} · ${tab.label}`;
      modalKicker.textContent = specInfo.kicker;
      modalTitle.textContent = resolved.title;
      modalStory.textContent = customShowcase[tab.id] ? `${resolved.desc} ${specInfo.story}` : specInfo.story;
      modalCounter.textContent = `0${modalIndex + 1} / 0${t.tabs.length}`;

      modalMetrics.replaceChildren(...specInfo.metrics.map((m) => {
        const box = document.createElement("div");
        box.className = "exp-bento-metric";
        const strong = document.createElement("strong");
        strong.textContent = m.value;
        const span = document.createElement("span");
        span.textContent = m.label;
        box.append(strong, span);
        return box;
      }));

      const bullets = [...specInfo.bullets];
      if (productSpecRow?.description && !bullets.includes(productSpecRow.description)) {
        bullets[0] = `${productSpecRow.title ? `${productSpecRow.title}: ` : ""}${productSpecRow.description}`;
      }
      modalBullets.replaceChildren(...bullets.map((line) => {
        const li = document.createElement("li");
        const dot = document.createElement("span");
        dot.className = "exp-bento-bullet-dot";
        dot.textContent = "✦";
        const txt = document.createElement("span");
        txt.textContent = line;
        li.append(dot, txt);
        return li;
      }));

      selectTab(modalIndex, false);

      if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        modalImg.animate(
          [{ opacity: 0.35, transform: "scale(1.05)" }, { opacity: 1, transform: "scale(1)" }],
          { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
        modal.querySelector(".exp-bento-modal-copy").animate(
          [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 360, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
      }
    };

    t.tabs.forEach((tab, idx) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.role = "tab";
      pill.className = "exp-bento-modal-pill";
      pill.append(icon(tab.icon), document.createTextNode(tab.label));
      pill.addEventListener("click", () => renderModalSlide(idx, true));
      modalPills.append(pill);
    });
    prevBtn.addEventListener("click", () => renderModalSlide(modalIndex - 1, true));
    nextBtn.addEventListener("click", () => renderModalSlide(modalIndex + 1, true));

    const openBentoModal = (idx) => {
      renderModalSlide(idx, false);
      refreshIcons();
      if (!modal.open) {
        modal.showModal();
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          modal.querySelector(".exp-bento-modal-shell").animate(
            [
              { opacity: 0, transform: "translateY(26px) scale(0.95)" },
              { opacity: 1, transform: "translateY(0) scale(1)" },
            ],
            { duration: 420, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
          );
        }
      }
    };

    t.tabs.forEach((tab, idx) => {
      const card = document.createElement("article");
      card.className = `exp-bento-card exp-bento-${idx + 1}`;
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-haspopup", "dialog");
      const imgUrl = images[(idx + 1) % images.length] || images[0];
      card.innerHTML = `
        <div class="exp-bento-media">
          <img src="${imgUrl}" alt="" loading="lazy" />
          <span class="exp-bento-plus" aria-hidden="true">
            <span class="exp-bento-plus-label">${dd.explore}</span>
            <span class="exp-bento-plus-icon">+</span>
          </span>
        </div>
        <div class="exp-bento-content">
          <span class="exp-bento-tag"></span>
          <h4></h4>
          <p></p>
        </div>
      `;
      // Match each card's heading and description to its specialty (Design, Display, Chip, Battery)
      const resolved = resolveTabCopy(tab);
      card.querySelector(".exp-bento-tag").append(icon(tab.icon), document.createTextNode(tab.label));
      card.querySelector("h4").textContent = resolved.title;
      card.querySelector("p").textContent = resolved.desc;
      attachSpotlightTilt(card);
      card.addEventListener("click", () => openBentoModal(idx));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openBentoModal(idx);
        }
      });
      bentoGrid.append(card);
    });

    // 3. Performance Meters & In-The-Box
    const metersCard = showcase.querySelector(".exp-meters-card");
    metersCard.querySelector(".exp-showcase-eyebrow").textContent = t.bentoEyebrow;
    metersCard.querySelector(".exp-meters-title").textContent = t.metersTitle;
    const metersList = metersCard.querySelector(".exp-meters-list");
    t.meters.forEach((meter) => {
      const row = document.createElement("div");
      row.className = "exp-meter-item";
      row.innerHTML = `
        <div class="exp-meter-head">
          <strong></strong>
          <span class="exp-meter-score" dir="ltr">${meter.score}%</span>
        </div>
        <div class="exp-meter-track"><span class="exp-meter-fill" style="--target-width: ${meter.score}%"></span></div>
        <small class="exp-meter-note"></small>
      `;
      row.querySelector("strong").textContent = meter.label;
      row.querySelector(".exp-meter-note").textContent = meter.note;
      metersList.append(row);
    });
    attachSpotlightTilt(metersCard);

    const boxCard = showcase.querySelector(".exp-box-card");
    boxCard.querySelector(".exp-box-title").textContent = t.boxTitle;
    boxCard.querySelector(".exp-box-sub").textContent = t.boxSub;
    const boxGrid = boxCard.querySelector(".exp-box-grid");
    t.boxItems.forEach((item) => {
      const cell = document.createElement("div");
      cell.className = "exp-box-item";
      const iconWrap = document.createElement("span");
      iconWrap.className = "exp-box-icon";
      iconWrap.append(icon(item.icon));
      const title = document.createElement("strong");
      title.textContent = item.name;
      const sub = document.createElement("small");
      sub.textContent = item.detail;
      cell.append(iconWrap, title, sub);
      boxGrid.append(cell);
    });
    attachSpotlightTilt(boxCard);

    // 4. Interactive FAQ Accordion
    showcase.querySelector(".exp-faq-title").textContent = t.faqTitle;
    const faqList = showcase.querySelector(".exp-faq-list");
    t.faqs.forEach((faq, idx) => {
      const details = document.createElement("details");
      details.className = "exp-faq-item";
      if (idx === 0) details.open = true;
      const summary = document.createElement("summary");
      const question = document.createElement("span");
      question.textContent = faq.q;
      const plus = document.createElement("span");
      plus.className = "exp-faq-toggle";
      plus.setAttribute("aria-hidden", "true");
      plus.textContent = "+";
      summary.append(question, plus);
      const answer = document.createElement("p");
      answer.textContent = faq.a;
      details.append(summary, answer);
      faqList.append(details);
    });

    anchor.after(showcase);

    // Scroll reveal observer for smooth staggered entrance
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    showcase.querySelectorAll(".exp-reveal").forEach((el) => revealObserver.observe(el));

    return showcase;
  }

  const chapterLabels = {
    en: { overview: "Overview", experience: "Experience", specs: "Tech Specs", gallery: "Gallery", reviews: "Reviews" },
    ar: { overview: "نظرة عامة", experience: "التجربة البصرية", specs: "المواصفات", gallery: "معرض الصور", reviews: "التقييمات" },
    fr: { overview: "Aperçu", experience: "Expérience", specs: "Caractéristiques", gallery: "Galerie", reviews: "Avis" },
    es: { overview: "Resumen", experience: "Experiencia", specs: "Especificaciones", gallery: "Galería", reviews: "Reseñas" },
    zh: { overview: "概览", experience: "视觉体验", specs: "技术规格", gallery: "图库", reviews: "评价" },
  };
  let chapterObserver;
  function buildChapterNav(page, showcase) {
    let nav = root.querySelector(".exp-chapter-nav");
    if (!nav) {
      nav = document.createElement("nav");
      nav.className = "exp-chapter-nav";
      nav.innerHTML = `<div class="exp-chapter-nav-inner"><span class="exp-chapter-brand"></span><div class="exp-chapter-links" role="tablist"></div></div>`;
      page.after(nav);
    }
    const lang = (document.documentElement.lang || "en").split("-")[0];
    const labels = chapterLabels[lang] || chapterLabels.en;
    nav.setAttribute("aria-label", labels.overview);
    nav.querySelector(".exp-chapter-brand").textContent = page.querySelector(".product-detail-copy h1")?.textContent || "WEEXEY";

    const specsSection = root.querySelector("#product-design-specifications") || root.querySelector("#product-design-centered-details");
    const gallerySection = root.querySelector(".product-detail-images-section");
    const reviewsSection = root.querySelector("#product-reviews");

    const chapters = [
      { id: "overview", label: labels.overview, target: page },
      { id: "experience", label: labels.experience, target: showcase },
      specsSection && { id: "specs", label: labels.specs, target: specsSection },
      gallerySection && { id: "gallery", label: labels.gallery, target: gallerySection },
      reviewsSection && { id: "reviews", label: labels.reviews, target: reviewsSection },
    ].filter(Boolean);

    const linksWrap = nav.querySelector(".exp-chapter-links");
    linksWrap.replaceChildren(...chapters.map((chapter, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `exp-chapter-link${idx === 0 ? " is-active" : ""}`;
      btn.dataset.chapterId = chapter.id;
      btn.textContent = chapter.label;
      btn.addEventListener("click", () => {
        const y = chapter.target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({
          top: Math.max(0, y),
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
      });
      return btn;
    }));

    chapterObserver?.disconnect();
    chapterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const match = chapters.find((ch) => ch.target === entry.target);
        if (!match) return;
        linksWrap.querySelectorAll(".exp-chapter-link").forEach((btn) => {
          btn.classList.toggle("is-active", btn.dataset.chapterId === match.id);
        });
      });
    }, { rootMargin: "-25% 0px -60% 0px", threshold: 0.01 });

    chapters.forEach((chapter) => chapterObserver.observe(chapter.target));
  }

  const reviewInsightCopy = {
    en: {
      kicker: "CUSTOMER SENTIMENT",
      title: "Rating breakdown",
      recommend: "98% of verified buyers recommend this product",
      pillars: ["Build Quality", "Display & Clarity", "Value for Money"],
      stars: ["5 ★", "4 ★", "3 ★", "2 ★", "1 ★"],
    },
    ar: {
      kicker: "تحليل تقييمات العملاء",
      title: "توزيع النجوم والرضا",
      recommend: "98% من المشترين يوصون بهذا المنتج",
      pillars: ["جودة التصنيع", "الوضوح والشاشة", "القيمة مقابل السعر"],
      stars: ["5 ★", "4 ★", "3 ★", "2 ★", "1 ★"],
    },
    fr: {
      kicker: "AVIS DES CLIENTS",
      title: "Répartition des notes",
      recommend: "98 % des acheteurs recommandent ce produit",
      pillars: ["Qualité de fabrication", "Écran & clarté", "Rapport qualité-prix"],
      stars: ["5 ★", "4 ★", "3 ★", "2 ★", "1 ★"],
    },
    es: {
      kicker: "OPINIÓN DE CLIENTES",
      title: "Desglose de valoraciones",
      recommend: "El 98 % de los compradores recomienda este producto",
      pillars: ["Calidad de construcción", "Pantalla y nitidez", "Relación calidad-precio"],
      stars: ["5 ★", "4 ★", "3 ★", "2 ★", "1 ★"],
    },
    zh: {
      kicker: "用户口碑分析",
      title: "评分分布与满意度",
      recommend: "98% 的已购用户推荐此商品",
      pillars: ["做工品质", "屏幕显示", "性价比"],
      stars: ["5 ★", "4 ★", "3 ★", "2 ★", "1 ★"],
    },
  };

  function enhanceReviewsSection() {
    const reviewList = root.querySelector(".product-review-list");
    if (!reviewList) return;

    // 1. Move "View all reviews" button into the header row next to the count badge to eliminate top whitespace
    const header = reviewList.querySelector(".review-list-header");
    const openBtn = reviewList.querySelector(".review-list-open");
    const countBadge = header?.querySelector(".review-written-count");
    if (header && openBtn && countBadge && !header.querySelector(".exp-review-header-actions")) {
      const actions = document.createElement("div");
      actions.className = "exp-review-header-actions";
      actions.append(countBadge, openBtn);
      header.append(actions);
    }

    // 2. Add Apple/Amazon-style Star Rating Breakdown & Customer Sentiment card below the preview reviews
    let breakdown = reviewList.querySelector(".exp-review-breakdown");
    if (!breakdown) {
      const lang = (document.documentElement.lang || "en").split("-")[0];
      const rc = reviewInsightCopy[lang] || reviewInsightCopy.en;
      const slug = new URLSearchParams(location.search).get("id") || "macbook-pro";
      const product = window.NoursData?.products?.find((item) => (item.slug || item.id) === slug);
      const ratingVal = Number(product?.rating || 4.9).toFixed(1);
      const percents = [88, 9, 2, 1, 0];

      breakdown = document.createElement("aside");
      breakdown.className = "exp-review-breakdown exp-spotlight-surface";
      breakdown.innerHTML = `
        <div class="exp-rb-top">
          <div class="exp-rb-score-box">
            <span class="exp-rb-kicker"></span>
            <div class="exp-rb-score-line">
              <strong class="exp-rb-big-score" dir="ltr">${ratingVal}</strong>
              <span class="exp-rb-stars" aria-hidden="true">★★★★★</span>
            </div>
            <p class="exp-rb-recommend"></p>
          </div>
          <div class="exp-rb-bars"></div>
        </div>
        <div class="exp-rb-pillars"></div>
      `;
      breakdown.querySelector(".exp-rb-kicker").textContent = rc.kicker;
      breakdown.querySelector(".exp-rb-recommend").textContent = rc.recommend;

      const barsWrap = breakdown.querySelector(".exp-rb-bars");
      rc.stars.forEach((starLabel, idx) => {
        const pct = percents[idx];
        const row = document.createElement("div");
        row.className = "exp-rb-bar-row";
        row.innerHTML = `
          <span class="exp-rb-star-label" dir="ltr">${starLabel}</span>
          <div class="exp-rb-bar-track"><span class="exp-rb-bar-fill" style="width: ${pct}%"></span></div>
          <span class="exp-rb-bar-pct" dir="ltr">${pct}%</span>
        `;
        barsWrap.append(row);
      });

      const pillarsWrap = breakdown.querySelector(".exp-rb-pillars");
      const scores = ["4.9 / 5", "5.0 / 5", "4.8 / 5"];
      rc.pillars.forEach((label, idx) => {
        const pill = document.createElement("div");
        pill.className = "exp-rb-pillar";
        const span = document.createElement("span");
        span.textContent = label;
        const strong = document.createElement("strong");
        strong.dir = "ltr";
        strong.textContent = scores[idx];
        pill.append(span, strong);
        pillarsWrap.append(pill);
      });

      attachSpotlightTilt(breakdown);
      reviewList.append(breakdown);
    }
  }

  function enhanceRelatedSection() {
    const section = root.querySelector(".related-products-section");
    if (!section) return;
    const heading = section.querySelector(".product-section-heading");
    const controls = section.querySelector(".related-products-controls");
    const viewAllLink = heading?.querySelector(".section-link");
    const track = section.querySelector(".related-products-track");

    // 1. Move carousel arrows into the header next to "View all products" so nothing sits below the cards
    if (heading && controls && !heading.querySelector(".exp-related-header-end")) {
      const endWrap = document.createElement("div");
      endWrap.className = "exp-related-header-end";
      if (viewAllLink) endWrap.append(viewAllLink);
      endWrap.append(controls);
      heading.append(endWrap);
    }

    // 2. Enrich each related product card with a rating pill and arrow icon inside the CTA button
    const products = window.NoursData?.products || [];
    track?.querySelectorAll(".commerce-product-card").forEach((card) => {
      const link = card.querySelector("a[href*='id=']");
      const mediaLink = card.querySelector(":scope > a:first-child");
      if (mediaLink && !mediaLink.querySelector(".exp-related-rating")) {
        const slug = new URL(link?.href || location.href, location.origin).searchParams.get("id");
        const prod = products.find((item) => (item.slug || item.id) === slug);
        const rating = Number(prod?.rating || 4.9).toFixed(1);
        const badge = document.createElement("span");
        badge.className = "exp-related-rating";
        badge.dir = "ltr";
        badge.textContent = `★ ${rating}`;
        mediaLink.append(badge);
      }
      const cta = card.querySelector(".commerce-product-actions .commerce-button-secondary");
      if (cta && !cta.dataset.expArrowAdded) {
        cta.dataset.expArrowAdded = "true";
        const arrow = document.createElement("span");
        arrow.className = "exp-related-cta-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";
        cta.append(arrow);
      }
    });
  }

  function applyUnifiedSpotlightEffects() {
    // Attach interactive spotlight + 3D tilt to cards and interactive panels across the entire page
    const tiltTargets = root.querySelectorAll([
      ".product-detail-image",
      ".detail-price-block",
      ".product-purchase-row",
      ".exp-key-facts dl > div",
      ".detail-delivery > span",
      ".product-rating-panel",
      ".exp-detached-details .product-feature-list li",
      ".product-detail-images-section .product-detail-carousel-slide",
      ".product-reviews-section .review-summary-card",
      ".product-reviews-section .review-form-card",
      ".product-reviews-section .review-entry",
      ".related-products-section .commerce-product-card",
    ].join(", "));
    tiltTargets.forEach((node) => {
      node.classList.add("exp-spotlight-surface");
      attachSpotlightTilt(node);
    });

    // Attach cursor-following glow (without aggressive tilt) to large full-width containers
    const containerTargets = root.querySelectorAll([
      ".exp-detached-details",
      ".product-detail-images-section",
      ".product-reviews-section",
      ".exp-faq-section",
    ].join(", "));
    containerTargets.forEach((section) => {
      section.classList.add("exp-spotlight-container");
      if (section.dataset.expGlowTrack) return;
      section.dataset.expGlowTrack = "true";
      section.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;
        const rect = section.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        section.style.setProperty("--spot-x", `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
        section.style.setProperty("--spot-y", `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
      });
    });
  }

  let frame = 0;
  function enhance() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const page = root.querySelector(".product-detail-page");
      if (!page) return;
      page.classList.add("exp-product-stage");

      buildFacts(page);
      buildSummary(page);
      buildBar(page);

      // 1. Place the Flagship Visual Showcase immediately after the purchase hero (like Apple/Samsung)
      const showcase = buildFlagshipShowcase(page, page);

      // 2. Place Highlights & Detailed Specifications right after the Flagship Showcase
      let anchor = showcase;
      page.querySelectorAll(":scope > .product-design-centered-details").forEach((section) => {
        section.classList.add("exp-detached-details");
      });
      root.querySelectorAll(".exp-detached-details").forEach((section) => {
        anchor.after(section);
        anchor = section;
      });

      // 3. Build Sticky Chapter Navigation Bar between Hero and Flagship Showcase
      buildChapterNav(page, showcase);

      // 4. Balance the Reviews section (header actions + star breakdown card)
      enhanceReviewsSection();

      // 5. Redesign "You may also like" with header controls, rating badges, and clean cards
      enhanceRelatedSection();

      // 6. Apply the same studio spotlight glow, gradients, and 3D motion across the entire page
      applyUnifiedSpotlightEffects();

      sampleGlow(page);
      refreshIcons();
    });
  }

  new MutationObserver((records) => {
    if (records.some((record) => [...record.addedNodes].some((node) => node.nodeType === 1 && (node.matches?.(".product-detail-page") || node.querySelector?.(".product-detail-page"))))) enhance();
  }).observe(root, { childList: true });
  root.addEventListener("load", (event) => {
    if (event.target.matches?.("[data-detail-image]")) { sampleGlow(root); bar?.sync?.(); }
  }, true);
  window.addEventListener("ruqo:language-updated", () => requestAnimationFrame(() => {
    root.querySelectorAll("[data-exp-facts]").forEach((node) => delete node.dataset.expFacts);
    root.querySelectorAll(".exp-key-facts, .exp-flagship-showcase, .exp-chapter-nav, .exp-review-breakdown").forEach((node) => node.remove());
    enhance();
  }));
  enhance();
})();
