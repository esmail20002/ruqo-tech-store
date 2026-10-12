(() => {
  const store = window.NoursStore;
  const products = window.NoursData.products;
  const page = document.body.dataset.page;
  const root = document.querySelector("[data-page-root]");
  let productQuantity = 1;
  let language = store.getLanguage();
  const text = {
    en: {
      home: "Home",
      products: "Shop",
      wishlist: "Wishlist",
      cart: "Bag",
      account: "Account",
      support: "Help",
      switch: "العربية",
      rights: "© 2026 RUQO TECH. All rights reserved.",
      terms: "Terms",
      privacy: "Privacy",
      shippingInfo: "Delivery",
      about: "About us",
      currencyLabel: "Change currency",
      previousImage: "Previous image",
      nextImage: "Next image",
      chooseVariant: "Choose an option",
      storage: "Storage",
      size: "Size",
      color: "Color",
      category: "Category",
      detailedSpecs: "View detailed specifications",
      hideSpecs: "Hide detailed specifications",
      detailsTitle: "Detailed specifications",
      aboutTitle: "Technology, chosen with care.",
      aboutIntro:
        "RUQO TECH brings considered technology and thoughtful service together, so every device feels like the right choice.",
      aboutStory:
        "We built RUQO TECH around a simple belief: buying technology should feel clear, considered, and dependable. Our collection focuses on useful innovation, trusted brands, and support that continues after delivery.",
      aboutValues: [
        "Curated, useful technology",
        "Clear service from checkout to delivery",
        "Support that stays with you",
      ],
      eyebrow: "RUQO TECH · considered technology",
      product: "Product details",
      notFound: "We couldn't find that product.",
      backShop: "Back to products",
      inStock: "In stock · ready to ship",
      outStock: "Currently unavailable",
      add: "Add to bag",
      added: "Added to your bag",
      saved: "Saved",
      save: "Save to wishlist",
      rating: "customer reviews",
      features: "Highlights",
      delivery: "Free delivery over 299 SAR",
      warranty: "2-year warranty",
      returns: "7-day returns",
      emptyWishTitle: "Your wishlist is waiting",
      emptyWish: "Save the products you love and find them here.",
      browse: "Explore products",
      savedCount: "saved products",
      moveToBag: "Add to bag",
      remove: "Remove",
      emptyCartTitle: "Your bag is empty",
      emptyCart: "Add something you love to get started.",
      continue: "Continue shopping",
      orderSummary: "Order summary",
      subtotal: "Subtotal",
      shippingCost: "Delivery",
      free: "Free",
      total: "Total",
      checkout: "Continue to checkout",
      shippingNote:
        "Delivery is free on orders over 299 SAR. Taxes are included.",
      bag: "Shopping bag",
      bagIntro: "Review your items before checkout.",
      checkoutTitle: "Checkout",
      checkoutIntro: "A few details, then your order is on its way.",
      contact: "Contact details",
      fullName: "Full name",
      email: "Email address",
      phone: "Mobile number",
      deliveryAddress: "Delivery address",
      city: "City",
      address: "Street address",
      postal: "Postal code",
      notes: "Delivery notes (optional)",
      payment: "Payment method",
      cod: "Cash on delivery",
      codNote: "Pay by cash or card when your order arrives.",
      confirmOrder: "Place order",
      noPayment:
        "This storefront demo does not collect or process online payments.",
      checkoutUnavailable: "Checkout is temporarily unavailable. Please try again later.",
      checkoutFailed: "We couldn't place your order. Your bag is unchanged; please try again.",
      orderPlaced: "Order confirmed",
      thankYou: "Thank you. Your order has been saved.",
      orderNumber: "Order number",
      viewAccount: "View your orders",
      profile: "Profile",
      settings: "Preferences",
      orders: "Orders",
      saveProfile: "Save profile",
      profileSaved: "Your profile has been saved.",
      updates: "Order updates",
      updatesNote: "Receive updates about deliveries and order status.",
      offers: "Offers and new arrivals",
      offersNote: "Receive occasional product news and store offers.",
      saveSettings: "Save preferences",
      settingsSaved: "Your preferences have been saved.",
      noOrders: "No orders yet",
      noOrdersNote: "Completed orders will appear here.",
      status: "Confirmed",
      helpTitle: "How can we help?",
      helpIntro:
        "Clear answers about delivery, payments, returns, and your account.",
      faq: "Frequently asked questions",
      deliveryTitle: "Delivery",
      deliveryBody:
        "We deliver across Saudi Arabia. Standard delivery usually arrives within 1–2 business days. Delivery is free on orders above 299 SAR; otherwise a 25 SAR delivery fee applies.",
      paymentsTitle: "Payment",
      paymentsBody:
        "Choose cash or card on delivery during checkout. Online card processing is not enabled in this storefront demo.",
      returnsTitle: "Returns and warranty",
      returnsBody:
        "You can request a return within 7 days of delivery for eligible items in their original condition. Products include a 2-year warranty against manufacturing defects.",
      accountTitle: "Orders and account",
      accountBody:
        "Your profile, preferences, wishlist, and demo order history are stored in this browser. No account or server-side customer record is created.",
      faqDelivery: "How long does delivery take?",
      faqDeliveryAnswer:
        "Most orders arrive in 1–2 business days. Remote areas may take longer; the support team can help with delivery questions.",
      faqReturn: "How do I request a return?",
      faqReturnAnswer:
        "Contact us within 7 days of receiving an eligible product. Keep the item and its accessories in their original condition.",
      faqWarranty: "What does the warranty cover?",
      faqWarrantyAnswer:
        "The 2-year warranty covers manufacturing defects. Accidental damage and normal wear are not included.",
      contactTitle: "Contact RUQO TECH",
      contactIntro: "Send a message and our support team will get back to you.",
      message: "Your message",
      sendMessage: "Send message",
      messageSent:
        "Your message is ready. Contact hello@noursstore.com for a real response.",
      termsTitle: "Terms of use",
      termsBody:
        "Product availability, prices, and delivery estimates shown here are illustrative and may change. Orders placed in this demo are stored only in your current browser and are not transmitted to a retailer. A real purchase requires a connected commerce and payment service.",
      privacyTitle: "Privacy notice",
      privacyBody:
        "This storefront demo keeps wishlist, cart, profile, preferences, and order history in local browser storage. The contact form does not transmit messages. Clearing browser storage removes this locally saved information.",
      helpLink: "Help & store policies",
      qty: "Quantity",
      item: "item",
      items: "items",
      cityDefault: "Riyadh",
      supportPhone: "+966 50 000 0000",
      supportEmail: "hello@noursstore.com",
      lowStock: "Only one left in stock",
      languageSaved: "Language preference saved in this browser.",
      categoryNames: {
        phones: "Phones",
        laptops: "Laptops",
        audio: "Audio",
        wearables: "Wearables",
      },
    },
    ar: {
      home: "الرئيسية",
      products: "تسوق",
      wishlist: "المفضلة",
      cart: "السلة",
      account: "حسابي",
      support: "المساعدة",
      switch: "English",
      rights: "© 2026 RUQO TECH. جميع الحقوق محفوظة.",
      terms: "الشروط",
      privacy: "الخصوصية",
      shippingInfo: "التوصيل",
      about: "من نحن",
      currencyLabel: "تغيير العملة",
      previousImage: "الصورة السابقة",
      nextImage: "الصورة التالية",
      chooseVariant: "اختر الخيار المناسب",
      storage: "السعة التخزينية",
      size: "المقاس",
      color: "اللون",
      category: "الفئة",
      detailedSpecs: "عرض المواصفات التفصيلية",
      hideSpecs: "إخفاء المواصفات التفصيلية",
      detailsTitle: "المواصفات التفصيلية",
      aboutTitle: "تقنية مختارة بعناية.",
      aboutIntro:
        "يجمع RUQO TECH بين التقنية المدروسة والخدمة الموثوقة لتجد الجهاز الأنسب لك.",
      aboutStory:
        "أسسنا RUQO TECH على قناعة بسيطة: شراء التقنية يجب أن يكون واضحًا ومدروسًا ويمكن الاعتماد عليه. نختار ابتكارات عملية وعلامات موثوقة، ونقدم دعمًا يستمر حتى بعد التوصيل.",
      aboutValues: [
        "تقنيات عملية مختارة بعناية",
        "خدمة واضحة من الطلب حتى التوصيل",
        "دعم يستمر معك",
      ],
      eyebrow: "RUQO TECH · تقنية مختارة بعناية",
      product: "تفاصيل المنتج",
      notFound: "لم نعثر على هذا المنتج.",
      backShop: "العودة للمنتجات",
      inStock: "متوفر · جاهز للشحن",
      outStock: "غير متوفر حاليًا",
      add: "أضف إلى السلة",
      added: "أضيف إلى سلتك",
      saved: "أضيف للمفضلة",
      save: "أضف للمفضلة",
      rating: "تقييمات العملاء",
      features: "أبرز الميزات",
      delivery: "توصيل مجاني للطلبات فوق 299 ر.س",
      warranty: "ضمان سنتين",
      returns: "استرجاع خلال 7 أيام",
      emptyWishTitle: "قائمة المفضلة بانتظارك",
      emptyWish: "احفظ المنتجات التي أعجبتك لتجدها هنا.",
      browse: "استكشف المنتجات",
      savedCount: "منتجات محفوظة",
      moveToBag: "أضف إلى السلة",
      remove: "إزالة",
      emptyCartTitle: "سلتك فارغة",
      emptyCart: "أضف المنتجات التي تعجبك لتبدأ.",
      continue: "متابعة التسوق",
      orderSummary: "ملخص الطلب",
      subtotal: "المجموع الفرعي",
      shippingCost: "التوصيل",
      free: "مجاني",
      total: "الإجمالي",
      checkout: "متابعة إلى الدفع",
      shippingNote: "التوصيل مجاني للطلبات فوق 299 ر.س. الضرائب مشمولة.",
      bag: "سلة التسوق",
      bagIntro: "راجع المنتجات قبل إتمام الطلب.",
      checkoutTitle: "إتمام الطلب",
      checkoutIntro: "أدخل بعض التفاصيل، ثم يصبح طلبك جاهزًا.",
      contact: "بيانات التواصل",
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الجوال",
      deliveryAddress: "عنوان التوصيل",
      city: "المدينة",
      address: "عنوان الشارع",
      postal: "الرمز البريدي",
      notes: "ملاحظات التوصيل (اختياري)",
      payment: "طريقة الدفع",
      cod: "الدفع عند الاستلام",
      codNote: "ادفع نقدًا أو بالبطاقة عند وصول الطلب.",
      confirmOrder: "تأكيد الطلب",
      noPayment:
        "هذه النسخة التجريبية لا تجمع المدفوعات الإلكترونية ولا تعالجها.",
      checkoutUnavailable: "إتمام الطلب غير متاح مؤقتًا. حاول مرة أخرى لاحقًا.",
      checkoutFailed: "تعذر تسجيل طلبك. لم تتغير السلة؛ يرجى المحاولة مجددًا.",
      orderPlaced: "تم تأكيد الطلب",
      thankYou: "شكرًا لك. تم حفظ طلبك.",
      orderNumber: "رقم الطلب",
      viewAccount: "عرض طلباتك",
      profile: "الملف الشخصي",
      settings: "التفضيلات",
      orders: "الطلبات",
      saveProfile: "حفظ الملف الشخصي",
      profileSaved: "تم حفظ بياناتك.",
      updates: "تحديثات الطلبات",
      updatesNote: "استقبل تحديثات التوصيل وحالة الطلب.",
      offers: "العروض والمنتجات الجديدة",
      offersNote: "استقبل أخبار المنتجات والعروض من وقت لآخر.",
      saveSettings: "حفظ التفضيلات",
      settingsSaved: "تم حفظ تفضيلاتك.",
      noOrders: "لا توجد طلبات بعد",
      noOrdersNote: "ستظهر طلباتك المكتملة هنا.",
      status: "مؤكد",
      helpTitle: "كيف يمكننا مساعدتك؟",
      helpIntro: "إجابات واضحة حول التوصيل والدفع والاسترجاع وحسابك.",
      faq: "الأسئلة الشائعة",
      deliveryTitle: "التوصيل",
      deliveryBody:
        "نوصل إلى جميع مناطق المملكة. يصل التوصيل المعتاد خلال يوم إلى يومي عمل. التوصيل مجاني للطلبات فوق 299 ر.س، وتُضاف رسوم 25 ر.س للطلبات الأقل.",
      paymentsTitle: "الدفع",
      paymentsBody:
        "اختر الدفع نقدًا أو بالبطاقة عند الاستلام. الدفع الإلكتروني غير مفعل في هذه النسخة التجريبية.",
      returnsTitle: "الاسترجاع والضمان",
      returnsBody:
        "يمكنك طلب استرجاع المنتجات المؤهلة خلال 7 أيام من الاستلام وبحالتها الأصلية. تشمل المنتجات ضمانًا لمدة سنتين ضد عيوب التصنيع.",
      accountTitle: "الطلبات والحساب",
      accountBody:
        "يتم حفظ ملفك وتفضيلاتك ومفضلتك وسجل الطلبات التجريبي في هذا المتصفح. لا يتم إنشاء حساب أو سجل عميل على خادم.",
      faqDelivery: "كم يستغرق التوصيل؟",
      faqDeliveryAnswer:
        "تصل معظم الطلبات خلال يوم إلى يومي عمل. قد يستغرق التوصيل للمناطق البعيدة وقتًا أطول، ويسعد فريق الدعم بمساعدتك.",
      faqReturn: "كيف أطلب استرجاعًا؟",
      faqReturnAnswer:
        "تواصل معنا خلال 7 أيام من استلام المنتج المؤهل. حافظ على المنتج وملحقاته بحالتها الأصلية.",
      faqWarranty: "ما الذي يشمله الضمان؟",
      faqWarrantyAnswer:
        "يغطي الضمان لمدة سنتين عيوب التصنيع. لا يشمل التلف العرضي أو الاستهلاك المعتاد.",
      contactTitle: "تواصل مع RUQO TECH",
      contactIntro: "أرسل رسالتك وسيتواصل معك فريق الدعم.",
      message: "رسالتك",
      sendMessage: "إرسال الرسالة",
      messageSent: "تم تجهيز رسالتك. للتواصل الفعلي راسل hello@noursstore.com.",
      termsTitle: "شروط الاستخدام",
      termsBody:
        "الأسعار والتوفر ومواعيد التوصيل المعروضة للتوضيح وقد تتغير. تُحفظ الطلبات التجريبية في متصفحك فقط ولا تُرسل إلى متجر. يتطلب الشراء الفعلي ربط خدمات التجارة والدفع.",
      privacyTitle: "سياسة الخصوصية",
      privacyBody:
        "تحفظ هذه النسخة التجريبية المفضلة والسلة والملف الشخصي والتفضيلات وسجل الطلبات في تخزين المتصفح المحلي. لا ترسل نماذج التواصل الرسائل. يؤدي مسح بيانات المتصفح إلى حذف المعلومات المحفوظة محليًا.",
      helpLink: "المساعدة وسياسات المتجر",
      qty: "الكمية",
      item: "منتج",
      items: "منتجات",
      cityDefault: "الرياض",
      supportPhone: "+966 50 000 0000",
      supportEmail: "hello@noursstore.com",
      lowStock: "بقيت قطعة واحدة فقط",
      languageSaved: "حُفظ اختيار اللغة في هذا المتصفح.",
      categoryNames: {
        phones: "الهواتف",
        laptops: "اللابتوبات",
        audio: "الصوتيات",
        wearables: "الأجهزة القابلة للارتداء",
      },
    },
    fr: {
      home: "Accueil", products: "Boutique", wishlist: "Favoris", cart: "Panier", account: "Compte", support: "Aide", switch: "العربية", rights: "© 2026 RUQO TECH. Tous droits réservés.", terms: "Conditions", privacy: "Confidentialité", shippingInfo: "Livraison", about: "À propos", currencyLabel: "Changer de devise", previousImage: "Image précédente", nextImage: "Image suivante", chooseVariant: "Choisir une option", storage: "Stockage", size: "Taille", color: "Couleur", category: "Catégorie", detailedSpecs: "Voir les caractéristiques détaillées", hideSpecs: "Masquer les caractéristiques", detailsTitle: "Caractéristiques détaillées", aboutTitle: "La technologie, choisie avec soin.", aboutIntro: "RUQO TECH réunit technologie réfléchie et service attentif pour que chaque appareil soit le bon choix.", aboutStory: "Nous avons créé RUQO TECH avec une conviction simple : acheter de la technologie doit être clair, réfléchi et fiable. Notre sélection privilégie l’innovation utile, les marques reconnues et un accompagnement qui continue après la livraison.", aboutValues: ["Technologie utile et soigneusement sélectionnée", "Un service clair de la commande à la livraison", "Une assistance toujours à vos côtés"], eyebrow: "RUQO TECH · la technologie en toute confiance", product: "Détails du produit", notFound: "Ce produit est introuvable.", backShop: "Retour aux produits", inStock: "En stock · prêt à expédier", outStock: "Actuellement indisponible", add: "Ajouter au panier", added: "Ajouté au panier", saved: "Enregistré", save: "Ajouter aux favoris", rating: "avis clients", features: "Points forts", delivery: "Livraison offerte dès 299 SAR", warranty: "Garantie de 2 ans", returns: "Retours sous 7 jours", emptyWishTitle: "Votre liste de favoris vous attend", emptyWish: "Enregistrez vos produits préférés pour les retrouver ici.", browse: "Découvrir les produits", savedCount: "produits enregistrés", moveToBag: "Ajouter au panier", remove: "Supprimer", emptyCartTitle: "Votre panier est vide", emptyCart: "Ajoutez un produit pour commencer.", continue: "Continuer les achats", orderSummary: "Récapitulatif de commande", subtotal: "Sous-total", shippingCost: "Livraison", free: "Offerte", total: "Total", checkout: "Continuer vers le paiement", shippingNote: "Livraison offerte dès 299 SAR. Taxes comprises.", bag: "Panier", bagIntro: "Vérifiez vos articles avant de commander.", checkoutTitle: "Finaliser la commande", checkoutIntro: "Quelques informations et votre commande est prête.", contact: "Coordonnées", fullName: "Nom complet", email: "Adresse e-mail", phone: "Téléphone portable", deliveryAddress: "Adresse de livraison", city: "Ville", address: "Adresse", postal: "Code postal", notes: "Instructions de livraison (facultatif)", payment: "Mode de paiement", cod: "Paiement à la livraison", codNote: "Payez en espèces ou par carte à la réception.", confirmOrder: "Confirmer la commande", noPayment: "Cette démo ne collecte ni ne traite les paiements en ligne.", orderPlaced: "Commande confirmée", thankYou: "Merci. Votre commande a été enregistrée.", orderNumber: "Numéro de commande", viewAccount: "Voir vos commandes", profile: "Profil", settings: "Préférences", orders: "Commandes", saveProfile: "Enregistrer le profil", profileSaved: "Votre profil a été enregistré.", updates: "Suivi des commandes", updatesNote: "Recevez des nouvelles sur la livraison et le statut de vos commandes.", offers: "Offres et nouveautés", offersNote: "Recevez occasionnellement des actualités et des offres.", saveSettings: "Enregistrer les préférences", settingsSaved: "Vos préférences ont été enregistrées.", noOrders: "Aucune commande", noOrdersNote: "Vos commandes terminées apparaîtront ici.", status: "Confirmée", helpTitle: "Comment pouvons-nous vous aider ?", helpIntro: "Des réponses claires sur la livraison, le paiement, les retours et votre compte.", faq: "Questions fréquentes", deliveryTitle: "Livraison", deliveryBody: "Nous livrons dans toute l’Arabie saoudite. La livraison standard prend généralement 1 à 2 jours ouvrés. Elle est offerte dès 299 SAR ; sinon, des frais de 25 SAR s’appliquent.", paymentsTitle: "Paiement", paymentsBody: "Choisissez le paiement en espèces ou par carte à la livraison. Le paiement en ligne n’est pas disponible dans cette démo.", returnsTitle: "Retours et garantie", returnsBody: "Vous pouvez demander le retour des articles éligibles sous 7 jours, dans leur état d’origine. Les produits bénéficient d’une garantie de 2 ans contre les défauts de fabrication.", accountTitle: "Commandes et compte", accountBody: "Votre profil, vos préférences, vos favoris et l’historique de démonstration sont enregistrés dans ce navigateur. Aucun compte ni dossier client n’est créé sur un serveur.", faqDelivery: "Quel est le délai de livraison ?", faqDeliveryAnswer: "La plupart des commandes arrivent sous 1 à 2 jours ouvrés. Les zones éloignées peuvent nécessiter plus de temps.", faqReturn: "Comment demander un retour ?", faqReturnAnswer: "Contactez-nous sous 7 jours après la réception d’un produit éligible et gardez-le avec ses accessoires dans leur état d’origine.", faqWarranty: "Que couvre la garantie ?", faqWarrantyAnswer: "La garantie de 2 ans couvre les défauts de fabrication, mais pas les dommages accidentels ni l’usure normale.", contactTitle: "Contacter RUQO TECH", contactIntro: "Envoyez-nous un message, notre équipe vous répondra.", message: "Votre message", sendMessage: "Envoyer le message", messageSent: "Votre message est prêt. Pour une réponse, écrivez à hello@noursstore.com.", termsTitle: "Conditions d’utilisation", termsBody: "Les disponibilités, prix et délais affichés sont indicatifs et peuvent changer. Les commandes de démonstration restent dans ce navigateur et ne sont pas transmises à un commerçant. Un achat réel nécessite un service de commerce et de paiement connecté.", privacyTitle: "Avis de confidentialité", privacyBody: "Cette démo conserve favoris, panier, profil, préférences et commandes dans le stockage local du navigateur. Le formulaire de contact n’envoie pas de messages. Effacer les données du navigateur supprimera ces informations.", helpLink: "Aide et politiques du magasin", qty: "Quantité", item: "article", items: "articles", cityDefault: "Riyad", supportPhone: "+966 50 000 0000", supportEmail: "hello@noursstore.com", lowStock: "Plus qu’un exemplaire", languageSaved: "La langue a été enregistrée dans ce navigateur.", categoryNames: { phones: "Téléphones", laptops: "Ordinateurs portables", audio: "Audio", wearables: "Objets connectés" },
    },
    es: {
      home: "Inicio", products: "Tienda", wishlist: "Favoritos", cart: "Carrito", account: "Cuenta", support: "Ayuda", switch: "العربية", rights: "© 2026 RUQO TECH. Todos los derechos reservados.", terms: "Condiciones", privacy: "Privacidad", shippingInfo: "Envío", about: "Sobre nosotros", currencyLabel: "Cambiar moneda", previousImage: "Imagen anterior", nextImage: "Imagen siguiente", chooseVariant: "Elige una opción", storage: "Almacenamiento", size: "Tamaño", color: "Color", category: "Categoría", detailedSpecs: "Ver especificaciones detalladas", hideSpecs: "Ocultar especificaciones", detailsTitle: "Especificaciones detalladas", aboutTitle: "Tecnología elegida con cuidado.", aboutIntro: "RUQO TECH une tecnología bien pensada y un servicio atento para ayudarte a elegir el dispositivo adecuado.", aboutStory: "Creamos RUQO TECH con una idea sencilla: comprar tecnología debe ser fácil, consciente y fiable. Nuestra selección prioriza la innovación útil, las marcas de confianza y el soporte que continúa después de la entrega.", aboutValues: ["Tecnología útil y cuidadosamente seleccionada", "Servicio claro desde el pedido hasta la entrega", "Asistencia que sigue contigo"], eyebrow: "RUQO TECH · tecnología con criterio", product: "Detalles del producto", notFound: "No encontramos este producto.", backShop: "Volver a productos", inStock: "Disponible · listo para enviar", outStock: "No disponible actualmente", add: "Añadir al carrito", added: "Añadido al carrito", saved: "Guardado", save: "Guardar en favoritos", rating: "opiniones de clientes", features: "Características", delivery: "Envío gratis a partir de 299 SAR", warranty: "Garantía de 2 años", returns: "Devoluciones en 7 días", emptyWishTitle: "Tu lista de favoritos te espera", emptyWish: "Guarda tus productos favoritos y encuéntralos aquí.", browse: "Explorar productos", savedCount: "productos guardados", moveToBag: "Añadir al carrito", remove: "Eliminar", emptyCartTitle: "Tu carrito está vacío", emptyCart: "Añade algo que te guste para empezar.", continue: "Seguir comprando", orderSummary: "Resumen del pedido", subtotal: "Subtotal", shippingCost: "Envío", free: "Gratis", total: "Total", checkout: "Continuar al pago", shippingNote: "Envío gratis en pedidos superiores a 299 SAR. Impuestos incluidos.", bag: "Carrito", bagIntro: "Revisa tus artículos antes de finalizar el pedido.", checkoutTitle: "Finalizar compra", checkoutIntro: "Completa unos datos y prepararemos tu pedido.", contact: "Datos de contacto", fullName: "Nombre completo", email: "Correo electrónico", phone: "Móvil", deliveryAddress: "Dirección de entrega", city: "Ciudad", address: "Dirección", postal: "Código postal", notes: "Notas de entrega (opcional)", payment: "Método de pago", cod: "Pago contra entrega", codNote: "Paga en efectivo o con tarjeta cuando llegue tu pedido.", confirmOrder: "Confirmar pedido", noPayment: "Esta demostración no recopila ni procesa pagos en línea.", orderPlaced: "Pedido confirmado", thankYou: "Gracias. Tu pedido se ha guardado.", orderNumber: "Número de pedido", viewAccount: "Ver tus pedidos", profile: "Perfil", settings: "Preferencias", orders: "Pedidos", saveProfile: "Guardar perfil", profileSaved: "Tu perfil se ha guardado.", updates: "Actualizaciones del pedido", updatesNote: "Recibe novedades sobre la entrega y el estado del pedido.", offers: "Ofertas y novedades", offersNote: "Recibe ocasionalmente noticias y ofertas de la tienda.", saveSettings: "Guardar preferencias", settingsSaved: "Tus preferencias se han guardado.", noOrders: "Aún no hay pedidos", noOrdersNote: "Aquí aparecerán tus pedidos completados.", status: "Confirmado", helpTitle: "¿Cómo podemos ayudarte?", helpIntro: "Respuestas claras sobre envíos, pagos, devoluciones y tu cuenta.", faq: "Preguntas frecuentes", deliveryTitle: "Envío", deliveryBody: "Enviamos a toda Arabia Saudí. La entrega estándar suele tardar entre 1 y 2 días laborables. El envío es gratis a partir de 299 SAR; en pedidos menores se aplican 25 SAR.", paymentsTitle: "Pago", paymentsBody: "Puedes pagar en efectivo o con tarjeta al recibir el pedido. El pago en línea no está habilitado en esta demostración.", returnsTitle: "Devoluciones y garantía", returnsBody: "Puedes solicitar la devolución de productos elegibles en un plazo de 7 días y en su estado original. Los productos incluyen 2 años de garantía frente a defectos de fabricación.", accountTitle: "Pedidos y cuenta", accountBody: "Tu perfil, preferencias, favoritos e historial de pedidos de prueba se guardan en este navegador. No se crea una cuenta ni un registro de cliente en un servidor.", faqDelivery: "¿Cuánto tarda el envío?", faqDeliveryAnswer: "La mayoría de los pedidos llegan en 1 o 2 días laborables. Las zonas remotas pueden tardar algo más.", faqReturn: "¿Cómo solicito una devolución?", faqReturnAnswer: "Contáctanos dentro de los 7 días posteriores a recibir un producto elegible y conserva el artículo con sus accesorios en su estado original.", faqWarranty: "¿Qué cubre la garantía?", faqWarrantyAnswer: "La garantía de 2 años cubre defectos de fabricación; no incluye daños accidentales ni desgaste normal.", contactTitle: "Contacta con RUQO TECH", contactIntro: "Envíanos un mensaje y nuestro equipo de soporte te responderá.", message: "Tu mensaje", sendMessage: "Enviar mensaje", messageSent: "Tu mensaje está preparado. Para recibir respuesta, escribe a hello@noursstore.com.", termsTitle: "Condiciones de uso", termsBody: "La disponibilidad, los precios y los plazos de entrega son orientativos y pueden cambiar. Los pedidos de prueba se guardan solo en este navegador y no se envían a ningún comercio. Una compra real requiere servicios de comercio y pago conectados.", privacyTitle: "Aviso de privacidad", privacyBody: "Esta demostración guarda favoritos, carrito, perfil, preferencias e historial en el almacenamiento local del navegador. El formulario de contacto no envía mensajes. Al borrar los datos del navegador se eliminará esta información.", helpLink: "Ayuda y políticas de la tienda", qty: "Cantidad", item: "artículo", items: "artículos", cityDefault: "Riad", supportPhone: "+966 50 000 0000", supportEmail: "hello@noursstore.com", lowStock: "Solo queda una unidad", languageSaved: "El idioma se ha guardado en este navegador.", categoryNames: { phones: "Móviles", laptops: "Portátiles", audio: "Audio", wearables: "Dispositivos vestibles" },
    },
    zh: {
      home: "首页", products: "选购", wishlist: "心愿单", cart: "购物袋", account: "账户", support: "帮助", switch: "العربية", rights: "© 2026 RUQO TECH。保留所有权利。", terms: "条款", privacy: "隐私", shippingInfo: "配送", about: "关于我们", currencyLabel: "更改货币", previousImage: "上一张图片", nextImage: "下一张图片", chooseVariant: "选择选项", storage: "存储容量", size: "尺寸", color: "颜色", category: "分类", detailedSpecs: "查看详细规格", hideSpecs: "隐藏详细规格", detailsTitle: "详细规格", aboutTitle: "用心甄选科技。", aboutIntro: "RUQO TECH 将精心挑选的科技产品与贴心服务结合，助你找到合适的设备。", aboutStory: "RUQO TECH 源于一个简单信念：购买科技产品应当清晰、周到且可靠。我们精选实用创新与可信品牌，并在配送后持续提供支持。", aboutValues: ["精心挑选的实用科技", "从下单到配送，服务清晰可靠", "始终陪伴你的支持服务"], eyebrow: "RUQO TECH · 用心甄选科技", product: "商品详情", notFound: "找不到该商品。", backShop: "返回商品列表", inStock: "有货 · 即刻发货", outStock: "暂时缺货", add: "加入购物袋", added: "已加入购物袋", saved: "已保存", save: "加入心愿单", rating: "客户评价", features: "产品亮点", delivery: "订单满 299 SAR 免运费", warranty: "两年保修", returns: "七天退货", emptyWishTitle: "你的心愿单已准备就绪", emptyWish: "保存喜欢的商品，之后可在这里查看。", browse: "浏览商品", savedCount: "件已保存商品", moveToBag: "加入购物袋", remove: "移除", emptyCartTitle: "购物袋为空", emptyCart: "添加喜欢的商品即可开始。", continue: "继续购物", orderSummary: "订单摘要", subtotal: "小计", shippingCost: "配送", free: "免费", total: "总计", checkout: "继续结账", shippingNote: "订单满 299 SAR 免运费，税费已包含。", bag: "购物袋", bagIntro: "结账前请确认商品。", checkoutTitle: "结账", checkoutIntro: "填写少量信息即可提交订单。", contact: "联系方式", fullName: "姓名", email: "电子邮箱", phone: "手机号码", deliveryAddress: "配送信息", city: "城市", address: "街道地址", postal: "邮政编码", notes: "配送备注（选填）", payment: "支付方式", cod: "货到付款", codNote: "收到商品时可使用现金或银行卡支付。", confirmOrder: "提交订单", noPayment: "此演示不会收集或处理在线支付。", orderPlaced: "订单已确认", thankYou: "谢谢，订单已保存。", orderNumber: "订单编号", viewAccount: "查看订单", profile: "个人资料", settings: "偏好设置", orders: "订单", saveProfile: "保存资料", profileSaved: "个人资料已保存。", updates: "订单更新", updatesNote: "接收配送与订单状态更新。", offers: "优惠与新品", offersNote: "不定期接收商品资讯和店铺优惠。", saveSettings: "保存偏好", settingsSaved: "偏好设置已保存。", noOrders: "暂无订单", noOrdersNote: "已完成的订单会显示在这里。", status: "已确认", helpTitle: "需要什么帮助？", helpIntro: "关于配送、支付、退货和账户的清晰解答。", faq: "常见问题", deliveryTitle: "配送", deliveryBody: "我们配送至沙特阿拉伯各地。标准配送通常需要 1 至 2 个工作日。订单满 299 SAR 免运费；不足时收取 25 SAR 配送费。", paymentsTitle: "支付", paymentsBody: "结账时可选择货到付款或刷卡。此演示暂不支持在线银行卡支付。", returnsTitle: "退货与保修", returnsBody: "符合条件的商品可在收货后 7 天内按原状申请退货。商品享有两年制造缺陷保修。", accountTitle: "订单与账户", accountBody: "个人资料、偏好、心愿单和演示订单历史保存在当前浏览器中，不会在服务器上创建账户或客户记录。", faqDelivery: "配送需要多长时间？", faqDeliveryAnswer: "大多数订单会在 1 至 2 个工作日内送达。偏远地区可能需要更长时间。", faqReturn: "如何申请退货？", faqReturnAnswer: "请在收到符合条件的商品后 7 天内联系我们，并保持商品及配件原有状态。", faqWarranty: "保修包含哪些内容？", faqWarrantyAnswer: "两年保修涵盖制造缺陷，不包括意外损坏和正常磨损。", contactTitle: "联系 RUQO TECH", contactIntro: "发送消息，我们的支持团队会回复你。", message: "你的消息", sendMessage: "发送消息", messageSent: "消息已准备好。如需实际回复，请联系 hello@noursstore.com。", termsTitle: "使用条款", termsBody: "此处显示的库存、价格和配送时间仅供参考，可能会发生变化。演示订单只保存在当前浏览器，不会发送给零售商。实际购买需要接入电商和支付服务。", privacyTitle: "隐私声明", privacyBody: "此演示将心愿单、购物袋、个人资料、偏好和订单历史保存在浏览器本地。联系表单不会发送消息。清除浏览器数据会删除这些信息。", helpLink: "帮助与店铺政策", qty: "数量", item: "件", items: "件", cityDefault: "利雅得", supportPhone: "+966 50 000 0000", supportEmail: "hello@noursstore.com", lowStock: "仅剩一件", languageSaved: "语言偏好已保存在此浏览器。", categoryNames: { phones: "手机", laptops: "笔记本电脑", audio: "音频", wearables: "可穿戴设备" },
    },
  };
  const supplementalText = {
    en: { navLabel: "Main navigation", openMenu: "Open menu", closeMenu: "Close menu", decreaseQuantity: "Decrease quantity", increaseQuantity: "Increase quantity", ratingLabel: "Rating", productReference: "Product reference", aboutStoryTitle: "Clearer choices. A store you can trust.", aboutValuesTitle: "WHAT WE VALUE", aboutContactEyebrow: "HERE WHEN YOU NEED US", productDetailStory: "Designed for reliable performance and a balanced everyday experience, with considered build quality and thoughtful details." },
    fr: { navLabel: "Navigation principale", openMenu: "Ouvrir le menu", closeMenu: "Fermer le menu", decreaseQuantity: "Diminuer la quantité", increaseQuantity: "Augmenter la quantité", ratingLabel: "Note", productReference: "Référence du produit", aboutStoryTitle: "Des choix clairs. Une boutique de confiance.", aboutValuesTitle: "NOS VALEURS", aboutContactEyebrow: "À VOTRE ÉCOUTE", productDetailStory: "Conçu pour offrir des performances fiables et un usage équilibré au quotidien, avec une fabrication soignée et des détails réfléchis." },
    es: { navLabel: "Navegación principal", openMenu: "Abrir menú", closeMenu: "Cerrar menú", decreaseQuantity: "Reducir cantidad", increaseQuantity: "Aumentar cantidad", ratingLabel: "Valoración", productReference: "Referencia del producto", aboutStoryTitle: "Elecciones claras. Una tienda de confianza.", aboutValuesTitle: "NUESTROS VALORES", aboutContactEyebrow: "AQUÍ CUANDO NOS NECESITES", productDetailStory: "Diseñado para ofrecer un rendimiento fiable y una experiencia equilibrada cada día, con una fabricación cuidada y detalles bien pensados." },
    zh: { navLabel: "主导航", openMenu: "打开菜单", closeMenu: "关闭菜单", decreaseQuantity: "减少数量", increaseQuantity: "增加数量", ratingLabel: "评分", productReference: "商品编号", aboutStoryTitle: "选择更清晰，购物更安心。", aboutValuesTitle: "我们的价值观", aboutContactEyebrow: "随时为你提供帮助", productDetailStory: "精心打造，带来可靠性能与平衡的日常体验，并注重品质与细节。" },
    ar: { navLabel: "التنقل الرئيسي", openMenu: "فتح القائمة", closeMenu: "إغلاق القائمة", decreaseQuantity: "تقليل الكمية", increaseQuantity: "زيادة الكمية", ratingLabel: "التقييم", productReference: "رقم المنتج", aboutStoryTitle: "اختيارات أوضح، وتجربة يمكن الوثوق بها.", aboutValuesTitle: "ما نؤمن به", aboutContactEyebrow: "نحن هنا لمساعدتك", productDetailStory: "صُمم ليقدم أداءً موثوقًا وتجربة يومية متوازنة، مع جودة تصنيع وعناية بالتفاصيل." },
  };
  const t = { ...(text[language] || text.en), ...supplementalText[language] };
  const currencyRates = { SAR: 1, USD: 1 / 3.75, EUR: 0.245 };
  const localeByLanguage = {
    en: "en-SA",
    fr: "fr-FR",
    es: "es-ES",
    zh: "zh-CN",
    ar: "ar-SA",
  };
  const variantTranslations = {
    fr: { Black: "Noir", Silver: "Argent", White: "Blanc", Small: "Petit", Large: "Grand" },
    es: { Black: "Negro", Silver: "Plateado", White: "Blanco", Small: "Pequeño", Large: "Grande" },
    zh: { Black: "黑色", Silver: "银色", White: "白色", Small: "小号", Large: "大号" },
    ar: { Black: "أسود", Silver: "فضي", White: "أبيض", Small: "صغير", Large: "كبير" },
  };
  const displayVariant = (label) => variantTranslations[language]?.[label] || label;
  const money = (amount) => {
    const currency = store.getCurrency();
    const locale = localeByLanguage[language] || localeByLanguage.en;
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "SAR" ? 0 : 2,
    }).format(amount * currencyRates[currency]);
  };
  const optionSet = (product) => {
    if (product.category === "phones") {
      const options =
        product.id === "ipad-air"
          ? ["128GB", "256GB", "512GB"]
          : ["256GB", "512GB", "1TB"];
      const baseIndex =
        product.id === "galaxy-s25" ? 1 : product.id === "iphone-16" ? 0 : 0;
      return {
        label: t.storage,
        options: options.map((label, index) => ({
          label,
          adjustment: (index - baseIndex) * 500,
        })),
      };
    }
    if (product.category === "laptops") {
      return {
        label: t.storage,
        options: ["512GB", "1TB", "2TB"].map((label, index) => ({
          label,
          adjustment: index * 700,
        })),
      };
    }
    if (product.category === "wearables") {
      const labels =
        product.id === "apple-watch"
          ? ["42mm", "46mm"]
          : product.id === "fitbit-sense"
            ? ["Small", "Large"]
            : ["40mm", "44mm"];
      return {
        label: t.size,
        options: labels.map((label, index) => ({
          label,
          adjustment: product.id === "fitbit-sense" ? 0 : index * 100,
        })),
      };
    }
    return {
      label: t.color,
      options: ["Black", "Silver", "White"].map((label) => ({
        label,
        adjustment: 0,
      })),
    };
  };
  const selectedOption = (product) => {
    const config = optionSet(product);
    const saved = store.getProductVariant(product.id);
    const fallbackIndex = product.id === "galaxy-s25" ? 1 : 0;
    const selected =
      config.options.find((option) => option.label === saved) ||
      config.options[fallbackIndex] ||
      config.options[0]
    return { ...selected, canonicalLabel: selected.label, label: displayVariant(selected.label) };
  };
  const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
  const escapeHtml = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const productUrl = (id) => `/product.html?id=${encodeURIComponent(id)}`;
  const localizeProduct = (product) =>
    window.NoursData.localizeProduct?.(product, language) || product;
  const productById = (id) => {
    const product = products.find((item) => item.id === id);
    return product ? localizeProduct(product) : undefined;
  };
  const header = document.querySelector("[data-site-header]");
  const footer = document.querySelector("[data-site-footer]");

  function renderShell() {
    header.innerHTML = `<header class="commerce-header"><div class="container commerce-nav"><a class="brand" href="/" aria-label="RUQO TECH"><img class="brand-logo" src="/images/ruqo-logo.png" alt="RUQO TECH" /></a><nav class="commerce-links" aria-label="${language === "ar" ? "التنقل الرئيسي" : "Main navigation"}"><a href="/">${t.home}</a><a href="/products.html">${t.products}</a><a href="/wishlist.html">${t.wishlist}</a><a href="/account.html">${t.account}</a><a href="/support.html">${t.support}</a></nav><div class="commerce-actions"><button class="commerce-icon-button theme-toggle" type="button" data-theme-toggle aria-pressed="false"><i data-lucide="moon" aria-hidden="true"></i></button><select class="commerce-currency currency-select" data-currency-select aria-label="${t.currencyLabel || "Currency"}" title="${t.currencyLabel || "Currency"}"><option value="USD">USD dollar</option><option value="SAR">SAR</option><option value="EUR">EUR</option></select><select class="commerce-lang language-select" data-language-select aria-label="Language" title="Language"><option value="en">EN</option><option value="fr">FR</option><option value="es">ES</option><option value="zh">ZH</option><option value="ar">عربي</option></select><a class="commerce-icon-button" href="/cart.html" aria-label="${t.cart}, ${store.cartCount()} ${t.items}">${icon("shopping-bag")}</a></div></div></header>`;
    footer.innerHTML = `<footer class="commerce-footer"><div class="container commerce-footer-inner"><a class="brand footer-brand" href="/" aria-label="RUQO TECH"><img class="brand-logo" src="/images/ruqo-logo.png" alt="RUQO TECH" /></a><span>${t.rights}</span><nav class="commerce-footer-links"><a href="/about.html">${t.about}</a><a href="/support.html#delivery">${t.shippingInfo}</a><a href="/support.html#terms">${t.terms}</a><a href="/support.html#privacy">${t.privacy}</a><a href="/support.html">${t.support}</a></nav></div></footer>`;
    const nav = header.querySelector(".commerce-links");
    nav.id = "commerce-navigation";
    nav.setAttribute("aria-label", t.navLabel);
    const cartLink = header.querySelector('a[href="/cart.html"]');
    cartLink.classList.add("commerce-cart-link");
    const cartBadge = document.createElement("span");
    cartBadge.className = "commerce-cart-count";
    cartBadge.dataset.cartCount = "";
    cartBadge.textContent = store.cartCount();
    cartLink.append(cartBadge);
    store.syncTheme();
    store.syncCartCount();
    const currencySelect = header.querySelector("[data-currency-select]");
    if (currencySelect) {
      currencySelect.value = store.getCurrency();
      currencySelect.addEventListener("change", (event) => {
        store.setCurrency(event.currentTarget.value);
        render();
      });
    }
    const languageSelect = header.querySelector("[data-language-select]");
    languageSelect.value = language;
    languageSelect.setAttribute(
      "aria-label",
      { en: "Language", fr: "Langue", es: "Idioma", zh: "语言", ar: "اللغة" }[language] || "Language",
    );
    languageSelect.addEventListener("change", (event) => {
      store.setLanguage(event.currentTarget.value);
      location.reload();
    });
    store.syncDropdowns();
    const menuButton = document.createElement("button");
    menuButton.className = "commerce-icon-button commerce-menu";
    menuButton.type = "button";
    menuButton.setAttribute("aria-label", t.openMenu);
    menuButton.setAttribute("aria-controls", nav.id);
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.innerHTML = `${icon("menu")}${icon("x")}`;
    header.querySelector(".commerce-actions").prepend(menuButton);
    const setMenuOpen = (isOpen) => {
      nav.classList.toggle("is-open", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? t.closeMenu : t.openMenu);
    };
    menuButton.addEventListener("click", () =>
      setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true"),
    );
    nav.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => setMenuOpen(false)),
    );
    if (header.dataset.menuDismissBound !== "true") {
      header.dataset.menuDismissBound = "true";
      document.addEventListener("click", (event) => {
        const currentButton = header.querySelector(".commerce-menu");
        const currentNav = header.querySelector(".commerce-links");
        if (
          currentButton?.getAttribute("aria-expanded") === "true" &&
          !currentButton.contains(event.target) &&
          !currentNav?.contains(event.target)
        ) {
          currentButton.click();
        }
      });
      document.addEventListener("keydown", (event) => {
        const currentButton = header.querySelector(".commerce-menu");
        if (
          event.key === "Escape" &&
          currentButton?.getAttribute("aria-expanded") === "true"
        ) {
          currentButton.click();
          currentButton.focus();
        }
      });
    }
  }

  function toast(message) {
    let node = document.querySelector(".commerce-toast");
    if (!node) {
      node = document.createElement("div");
      node.className = "commerce-toast";
      node.setAttribute("role", "status");
      document.body.append(node);
    }
    node.textContent = message;
    node.classList.add("is-visible");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("is-visible"), 2200);
  }

  function productCard(product) {
    product = localizeProduct(product);
    const saved = store.wishlist().includes(product.id);
    return `<article class="commerce-product-card"><a href="${productUrl(product.id)}"><img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" /></a><div class="commerce-product-info"><span class="commerce-product-brand">${escapeHtml(product.brand)}</span><h2><a href="${productUrl(product.id)}">${escapeHtml(product.name)}</a></h2><p>${escapeHtml(product.description[language])}</p><div class="commerce-product-actions"><strong class="commerce-price">${money(product.price)}</strong><button class="commerce-button" type="button" data-add="${product.id}" ${product.stock ? "" : "disabled"}>${icon("shopping-bag")}<span>${t.moveToBag}</span></button><button class="commerce-danger" type="button" data-remove-wish="${product.id}" aria-label="${t.remove}">${icon(saved ? "heart-off" : "heart")}</button></div></div></article>`;
  }

  function renderProduct() {
    const product = productById(new URLSearchParams(location.search).get("id"));
    if (!product) {
      root.innerHTML = `<section class="commerce-empty">${icon("package-x")}<h1>${t.notFound}</h1><a class="commerce-button" href="/products.html">${t.backShop}</a></section>`;
      return;
    }
    document.title = `${product.name} | RUQO TECH`;
    const isSaved = store.wishlist().includes(product.id);
    const detail = {
      en: {
        gallery: "Product gallery",
        galleryNote:
          "See this piece alongside other picks from its collection.",
        previousImage: "Previous image",
        nextImage: "Next image",
        view: "View",
        zoom: "View larger image",
        specs: "Specifications",
        detailedSpecs: "View detailed specifications",
        detailsTitle: "Detailed specifications",
        labels: {
          phones: [
            "Camera / platform",
            "Storage / display",
            "Core technology",
            "Design / experience",
          ],
          laptops: [
            "Display",
            "Processor",
            "Memory / design",
            "Power / connectivity",
          ],
          audio: ["Sound", "Noise control", "Connectivity", "Comfort"],
          wearables: ["Health", "Tracking", "Connectivity", "Design"],
        },
        arrival: "Estimated delivery",
        arrivalValue: "1–2 business days",
        secure: "Secure checkout",
        returnsInfo: "7-day return window",
        reviewTitle: "Ratings & reviews",
        basedOn: "Based on customer ratings",
        reviewForm: "Share your experience",
        reviewName: "Your name",
        reviewText: "Your review",
        reviewSubmit: "Submit review",
        reviewThanks: "Thanks. Your review is saved on this device.",
        recentReviews: "Recent reviews",
        verified: "Customer review",
        related: "You may also like",
        keepBrowsing: "View all products",
        image: "Collection image",
        quantity: "Quantity",
        close: "Close image",
        noReviews:
          "Written review excerpts are not available yet. Share your experience below.",
      },
      ar: {
        gallery: "معرض صور المنتج",
        galleryNote: "شاهد المنتج مع اختيارات أخرى من الفئة نفسها.",
        previousImage: "الصورة السابقة",
        nextImage: "الصورة التالية",
        view: "عرض",
        zoom: "تكبير الصورة",
        specs: "المواصفات",
        detailedSpecs: "عرض المواصفات التفصيلية",
        detailsTitle: "المواصفات التفصيلية",
        labels: {
          phones: [
            "الكاميرا / المنصة",
            "التخزين / الشاشة",
            "التقنية الأساسية",
            "التصميم / التجربة",
          ],
          laptops: [
            "الشاشة",
            "المعالج",
            "الذاكرة / التصميم",
            "الطاقة / الاتصال",
          ],
          audio: ["الصوت", "عزل الضجيج", "الاتصال", "الراحة"],
          wearables: ["الصحة", "المتابعة", "الاتصال", "التصميم"],
        },
        arrival: "موعد التوصيل المتوقع",
        arrivalValue: "خلال يوم إلى يومي عمل",
        secure: "إتمام شراء آمن",
        returnsInfo: "استرجاع خلال 7 أيام",
        reviewTitle: "التقييمات والمراجعات",
        basedOn: "بناءً على تقييمات العملاء",
        reviewForm: "شاركنا تجربتك",
        reviewName: "اسمك",
        reviewText: "مراجعتك",
        reviewSubmit: "إرسال التقييم",
        reviewThanks: "شكرًا لك، تم حفظ مراجعتك على هذا الجهاز.",
        recentReviews: "أحدث المراجعات",
        verified: "مراجعة عميل",
        related: "قد يعجبك أيضًا",
        keepBrowsing: "عرض كل المنتجات",
        image: "صورة من الفئة",
        quantity: "الكمية",
        close: "إغلاق الصورة",
        noReviews: "لا تتوفر مراجعات مكتوبة للعرض حاليًا. شارك تجربتك أدناه.",
      },
      fr: {
        gallery: "Galerie du produit", galleryNote: "Découvrez ce produit avec d’autres articles de sa collection.", previousImage: "Image précédente", nextImage: "Image suivante", view: "Voir", zoom: "Agrandir l’image", specs: "Caractéristiques", detailedSpecs: "Voir les caractéristiques détaillées", detailsTitle: "Caractéristiques détaillées", labels: { phones: ["Appareil photo / plateforme", "Stockage / écran", "Technologie principale", "Design / expérience"], laptops: ["Écran", "Processeur", "Mémoire / design", "Alimentation / connectivité"], audio: ["Son", "Réduction du bruit", "Connectivité", "Confort"], wearables: ["Santé", "Suivi", "Connectivité", "Design"] }, arrival: "Livraison estimée", arrivalValue: "1 à 2 jours ouvrés", secure: "Paiement sécurisé", returnsInfo: "Retours sous 7 jours", reviewTitle: "Notes et avis", basedOn: "Selon les avis clients", reviewForm: "Partagez votre expérience", reviewName: "Votre nom", reviewText: "Votre avis", reviewSubmit: "Envoyer l’avis", reviewThanks: "Merci. Votre avis est enregistré sur cet appareil.", recentReviews: "Avis récents", verified: "Avis client", related: "Vous aimerez aussi", keepBrowsing: "Voir tous les produits", quantity: "Quantité", close: "Fermer l’image", noReviews: "Aucun avis écrit n’est encore disponible. Partagez votre expérience ci-dessous.",
      },
      es: {
        gallery: "Galería del producto", galleryNote: "Descubre este producto junto a otras opciones de su colección.", previousImage: "Imagen anterior", nextImage: "Imagen siguiente", view: "Ver", zoom: "Ampliar imagen", specs: "Especificaciones", detailedSpecs: "Ver especificaciones detalladas", detailsTitle: "Especificaciones detalladas", labels: { phones: ["Cámara / plataforma", "Almacenamiento / pantalla", "Tecnología principal", "Diseño / experiencia"], laptops: ["Pantalla", "Procesador", "Memoria / diseño", "Potencia / conectividad"], audio: ["Sonido", "Control de ruido", "Conectividad", "Comodidad"], wearables: ["Salud", "Seguimiento", "Conectividad", "Diseño"] }, arrival: "Entrega estimada", arrivalValue: "1–2 días laborables", secure: "Pago seguro", returnsInfo: "Devoluciones en 7 días", reviewTitle: "Valoraciones y reseñas", basedOn: "Según las valoraciones de clientes", reviewForm: "Comparte tu experiencia", reviewName: "Tu nombre", reviewText: "Tu opinión", reviewSubmit: "Enviar reseña", reviewThanks: "Gracias. Tu reseña se ha guardado en este dispositivo.", recentReviews: "Reseñas recientes", verified: "Opinión de cliente", related: "También te puede gustar", keepBrowsing: "Ver todos los productos", quantity: "Cantidad", close: "Cerrar imagen", noReviews: "Aún no hay reseñas escritas. Comparte tu experiencia a continuación.",
      },
      zh: {
        gallery: "商品图片集", galleryNote: "查看此商品及同系列精选产品。", previousImage: "上一张图片", nextImage: "下一张图片", view: "查看", zoom: "放大图片", specs: "规格", detailedSpecs: "查看详细规格", detailsTitle: "详细规格", labels: { phones: ["相机 / 平台", "存储 / 屏幕", "核心技术", "设计 / 体验"], laptops: ["显示屏", "处理器", "内存 / 设计", "电源 / 连接"], audio: ["音质", "降噪", "连接方式", "佩戴舒适度"], wearables: ["健康", "追踪", "连接方式", "设计"] }, arrival: "预计送达", arrivalValue: "1 至 2 个工作日", secure: "安全结账", returnsInfo: "七天退货期限", reviewTitle: "评分与评价", basedOn: "根据客户评分", reviewForm: "分享你的体验", reviewName: "你的姓名", reviewText: "你的评价", reviewSubmit: "提交评价", reviewThanks: "谢谢，评价已保存在此设备上。", recentReviews: "最近评价", verified: "客户评价", related: "你可能也喜欢", keepBrowsing: "查看全部商品", quantity: "数量", close: "关闭图片", noReviews: "暂时没有文字评价，欢迎在下方分享你的体验。",
      },
    }[language] || {
      gallery: "Product gallery", galleryNote: "Explore this item alongside other picks from its collection.", previousImage: "Previous image", nextImage: "Next image", view: "View", zoom: "View larger image", specs: "Specifications", detailedSpecs: "View detailed specifications", detailsTitle: "Detailed specifications", labels: { phones: ["Camera / platform", "Storage / display", "Core technology", "Design / experience"], laptops: ["Display", "Processor", "Memory / design", "Power / connectivity"], audio: ["Sound", "Noise control", "Connectivity", "Comfort"], wearables: ["Health", "Tracking", "Connectivity", "Design"] }, arrival: "Estimated delivery", arrivalValue: "1–2 business days", secure: "Secure checkout", returnsInfo: "7-day return window", reviewTitle: "Ratings & reviews", basedOn: "Based on customer ratings", reviewForm: "Share your experience", reviewName: "Your name", reviewText: "Your review", reviewSubmit: "Submit review", reviewThanks: "Thanks. Your review is saved on this device.", recentReviews: "Recent reviews", verified: "Customer review", related: "You may also like", keepBrowsing: "View all products", quantity: "Quantity", close: "Close image", noReviews: "Written review excerpts are not available yet. Share your experience below.",
    };
    const categoryImages = products
      .filter((item) => item.category === product.category)
      .map(localizeProduct);
    const gallery = [
      product,
      ...categoryImages.filter((item) => item.id !== product.id),
    ].slice(0, 4);
    const galleryMarkup = gallery
      .map(
        (item, index) =>
          `<button class="product-gallery-thumb${index === 0 ? " is-active" : ""}" type="button" data-gallery-image="${item.image}" data-gallery-alt="${escapeHtml(item.name)}" aria-label="${detail.view} ${index + 1}" aria-pressed="${index === 0}"><img src="${item.image}" alt="" loading="lazy" /></button>`,
      )
      .join("");
    const labels = detail.labels[product.category];
    const specs = product.features[language]
      .map(
        (feature, index) =>
          `<div class="product-spec-row"><span>${labels[index] || detail.specs}</span><strong>${escapeHtml(feature)}</strong></div>`,
      )
      .join("");
    const discount = product.oldPrice
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0;
    const related = products
      .filter(
        (item) => item.category === product.category && item.id !== product.id,
      )
      .slice(0, 3)
      .map(localizeProduct);
    const reviews = store.read(`nours-reviews-${product.id}`, []);
    const reviewTotal = product.reviews + reviews.length;
    const reviewScore =
      reviews.reduce(
        (sum, review) => sum + Number(review.rating),
        product.rating * product.reviews,
      ) / reviewTotal;
    const ratingPercent = Math.round((reviewScore / 5) * 100);
    const recommendations = (
      related.length
        ? related
        : products
            .filter((item) => item.id !== product.id)
            .slice(0, 3)
            .map(localizeProduct)
    )
      .map(
        (item) =>
          `<article class="commerce-product-card"><a href="${productUrl(item.id)}"><img src="${item.image}" alt="${escapeHtml(item.name)}" loading="lazy" /></a><div class="commerce-product-info"><span class="commerce-product-brand">${escapeHtml(item.brand)}</span><h2><a href="${productUrl(item.id)}">${escapeHtml(item.name)}</a></h2><p>${escapeHtml(item.description[language])}</p><div class="commerce-product-actions"><strong class="commerce-price">${money(item.price)}</strong><a class="commerce-button-secondary" href="${productUrl(item.id)}">${detail.view}</a></div></div></article>`,
      )
      .join("");
    root.innerHTML = `<div class="commerce-breadcrumb"><a href="/">${t.home}</a> / <a href="/products.html">${t.products}</a> / ${escapeHtml(product.name)}</div><section class="product-detail-layout product-detail-page"><div class="product-detail-gallery"><div class="product-detail-image"><img data-detail-image src="${product.image}" alt="${escapeHtml(product.name)}" fetchpriority="high" /><span class="detail-image-label">${escapeHtml(product.brand)}</span><button class="detail-zoom" type="button" data-gallery-zoom aria-label="${detail.zoom}">${icon("expand")}</button></div><div class="product-gallery-thumbs" aria-label="${detail.gallery}">${galleryMarkup}</div><p class="gallery-caption">${detail.galleryNote}</p></div><div class="product-detail-copy"><div class="detail-reveal detail-reveal-1"><span class="commerce-eyebrow">${escapeHtml(product.brand)} · ${t.categoryNames[product.category]}</span><h1>${escapeHtml(product.name)}</h1><p class="detail-description">${escapeHtml(product.description[language])}</p><a class="detail-rating-link" href="#product-reviews"><span class="product-detail-rating">${icon("star")} ${product.rating.toFixed(1)}</span><span>${product.reviews} ${t.rating}</span><span class="detail-rating-arrow">↓</span></a></div><div class="detail-price-block detail-reveal detail-reveal-2"><div class="product-detail-price"><strong>${money(product.price)}</strong>${product.oldPrice ? `<del>${money(product.oldPrice)}</del>` : ""}${discount ? `<span class="detail-discount">-${discount}%</span>` : ""}</div><p class="detail-tax-note">${detail.secure} · ${detail.returnsInfo}</p></div><div class="product-detail-stock detail-reveal detail-reveal-2 ${product.stock ? "" : "is-out"}"><span class="stock-pulse"></span>${product.stock ? t.inStock : t.outStock}</div><div class="product-purchase-row detail-reveal detail-reveal-3"><div class="product-quantity"><span>${detail.quantity}</span><div class="quantity-control"><button type="button" data-detail-quantity="-1" aria-label="Decrease quantity">−</button><output data-detail-quantity-value>1</output><button type="button" data-detail-quantity="1" aria-label="Increase quantity">+</button></div></div><button class="commerce-button detail-add-button" type="button" data-add="${product.id}" ${product.stock ? "" : "disabled"}>${icon("shopping-bag")} ${t.add}</button><button class="commerce-button-secondary detail-wish-button" type="button" data-toggle-wish="${product.id}" aria-label="${isSaved ? t.saved : t.save}">${icon(isSaved ? "heart-off" : "heart")}</button></div><div class="detail-delivery detail-reveal detail-reveal-3"><span>${icon("truck")}<span><strong>${detail.arrival}</strong><small>${detail.arrivalValue}</small></span></span><span>${icon("shield-check")}<span><strong>${t.warranty}</strong><small>${detail.secure}</small></span></span><span>${icon("rotate-ccw")}<span><strong>${detail.returnsInfo}</strong><small>${t.returns}</small></span></span></div></div></section><section class="product-detail-lower"><div class="product-information-block detail-scroll-reveal"><div class="product-section-heading"><span class="commerce-eyebrow">${t.features}</span><h2>${detail.specs}</h2></div><p class="product-long-description">${escapeHtml(product.description[language])} ${language === "ar" ? "صُمم ليقدم أداءً موثوقًا وتجربة يومية متوازنة، مع جودة تصنيع وعناية بالتفاصيل." : "Designed for dependable performance and a balanced everyday experience, with considered materials and attention to detail."}</p><div class="product-spec-table">${specs}<div class="product-spec-row"><span>${language === "ar" ? "العلامة التجارية" : "Brand"}</span><strong>${escapeHtml(product.brand)}</strong></div><div class="product-spec-row"><span>${language === "ar" ? "الفئة" : "Category"}</span><strong>${t.categoryNames[product.category]}</strong></div><div class="product-spec-row"><span>${language === "ar" ? "رقم المنتج" : "Product reference"}</span><strong>${product.id.toUpperCase()}</strong></div></div></div><aside class="product-rating-panel detail-scroll-reveal"><span class="commerce-eyebrow">${detail.basedOn}</span><div class="rating-panel-score"><strong>${product.rating.toFixed(1)}</strong><span>${icon("star")}<span>${product.reviews} ${t.rating}</span></span></div><div class="rating-meter"><span style="--rating-fill:${ratingPercent}%"></span></div><p>${detail.basedOn}</p><a href="#review-form" class="commerce-button-secondary">${detail.reviewForm}</a></aside></section><section class="product-reviews-section detail-scroll-reveal" id="product-reviews"><div class="product-section-heading"><span class="commerce-eyebrow">${product.reviews} ${t.rating}</span><h2>${detail.reviewTitle}</h2></div><div class="product-review-layout"><div class="product-review-list">${
      reviews.length
        ? `<h3>${detail.recentReviews}</h3>${reviews
            .slice()
            .reverse()
            .map(
              (review) =>
                `<article class="product-review"><div class="review-author"><strong>${escapeHtml(review.name)}</strong><span>${detail.verified}</span><span class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span></div><p>${escapeHtml(review.text)}</p></article>`,
            )
            .join("")}`
        : `<div class="review-empty">${icon("message-circle")}<p>${detail.noReviews}</p></div>`
    }</div><form class="product-review-form" id="review-form" data-product-review><h3>${detail.reviewForm}</h3><label class="commerce-field">${detail.reviewName}<input name="name" maxlength="60" required /></label><label class="commerce-field">${language === "ar" ? "التقييم" : "Rating"}<select name="rating"><option value="5">5 ★</option><option value="4">4 ★</option><option value="3">3 ★</option><option value="2">2 ★</option><option value="1">1 ★</option></select></label><label class="commerce-field">${detail.reviewText}<textarea name="text" minlength="8" maxlength="600" required></textarea></label><div class="form-feedback" data-review-feedback aria-live="polite"></div><button class="commerce-button" type="submit">${detail.reviewSubmit}</button></form></div></section><section class="related-products-section detail-scroll-reveal"><div class="product-section-heading"><div><span class="commerce-eyebrow">${escapeHtml(product.brand)}</span><h2>${detail.related}</h2></div><a href="/products.html?category=${product.category}" class="section-link">${detail.keepBrowsing} ${icon("arrow-up-left")}</a></div><div class="commerce-product-grid">${recommendations}</div></section><dialog class="product-lightbox" data-product-lightbox><button type="button" data-close-lightbox aria-label="${detail.close}">${icon("x")}</button><img src="${product.image}" alt="${escapeHtml(product.name)}" /></dialog>`;
    root.querySelector(".product-long-description").textContent =
      `${product.description[language]} ${t.productDetailStory}`;
    root.querySelector(
      ".product-review-form .commerce-field:nth-of-type(2)",
    ).childNodes[0].textContent = `${t.ratingLabel} `;
    const currentOption = selectedOption(product);
    const optionConfig = optionSet(product);
    const optionPicker = document.createElement("fieldset");
    optionPicker.className = "product-variant-picker";
    optionPicker.classList.toggle("is-color", optionConfig.label === t.color);
    optionPicker.innerHTML = `<legend>${optionConfig.label}</legend><div class="product-variant-options" role="radiogroup" aria-label="${optionConfig.label}">${optionConfig.options.map((option) => `<button type="button" class="product-variant-option${displayVariant(option.label) === currentOption.label ? " is-selected" : ""}" role="radio" aria-checked="${displayVariant(option.label) === currentOption.label}" data-product-option="${escapeHtml(option.label)}"><span class="variant-swatch"></span><span>${escapeHtml(displayVariant(option.label))}</span></button>`).join("")}</div>`;
    const quantityBlock = root.querySelector(".product-quantity");
    const optionColumn = document.createElement("div");
    optionColumn.className = "product-buy-config";
    quantityBlock.before(optionColumn);
    optionColumn.append(quantityBlock, optionPicker);

    const currencyEdit = document.createElement("button");
    currencyEdit.className = "currency-edit";
    currencyEdit.type = "button";
    currencyEdit.title = t.currencyLabel;
    currencyEdit.setAttribute("aria-label", t.currencyLabel);
    currencyEdit.innerHTML = icon("coins");
    const currencySelect = document.createElement("select");
    currencySelect.className = "currency-select";
    currencySelect.setAttribute("aria-label", t.currencyLabel);
    currencySelect.hidden = true;
    currencySelect.innerHTML =
      '<option value="USD">USD ($)</option><option value="SAR">SAR (ر.س)</option><option value="EUR">EUR (€)</option>';
    currencySelect.value = store.getCurrency();
    root
      .querySelector(".product-detail-price")
      .append(currencyEdit, currencySelect);
    const detailPriceBlock = root.querySelector(".detail-price-block");
    root.querySelector(".gallery-caption").before(detailPriceBlock);
    const currentPrice = product.price + currentOption.adjustment;
    root.querySelector(".product-detail-price > strong").textContent =
      money(currentPrice);
    const oldPrice = root.querySelector(".product-detail-price del");
    if (oldPrice)
      oldPrice.textContent = money(product.oldPrice + currentOption.adjustment);
    const currentDiscount = oldPrice
      ? Math.round(
          (1 - currentPrice / (product.oldPrice + currentOption.adjustment)) *
            100,
        )
      : 0;
    const discountBadge = root.querySelector(".detail-discount");
    if (discountBadge) discountBadge.textContent = `-${currentDiscount}%`;
    currencyEdit.addEventListener("click", () => {
      currencyEdit.hidden = true;
      currencySelect.hidden = false;
      currencySelect.focus();
    });
    currencySelect.addEventListener("change", () => {
      store.setCurrency(currencySelect.value);
      renderProduct();
    });
    optionPicker.addEventListener("click", (event) => {
      const optionButton = event.target.closest("[data-product-option]");
      if (!optionButton) return;
      store.setProductVariant(product.id, optionButton.dataset.productOption);
      renderProduct();
    });

    let featureList = root.querySelector(".product-feature-list");
    if (!featureList) {
      const featureHeading = document.createElement("h2");
      featureHeading.className = "product-feature-heading";
      featureHeading.textContent = t.features;
      featureList = document.createElement("ul");
      featureList.className = "product-feature-list";
      featureList.innerHTML = product.features[language]
        .map(
          (feature) =>
            `<li>${icon("circle-check")}<span>${escapeHtml(feature)}</span></li>`,
        )
        .join("");
      root
        .querySelector(".detail-rating-link")
        .before(featureHeading, featureList);
    }

    const detailsDisclosure = document.createElement("details");
    detailsDisclosure.className = "product-spec-disclosure";
    detailsDisclosure.innerHTML = `<summary>${icon("chevron-down")}<span>${detail.detailedSpecs}</span></summary><div class="product-spec-expanded"><h3>${detail.detailsTitle}</h3><p>${escapeHtml(product.description[language])}</p><div class="product-spec-table">${specs}<div class="product-spec-row"><span>${t.category}</span><strong>${t.categoryNames[product.category]}</strong></div><div class="product-spec-row"><span>${language === "ar" ? "رقم المنتج" : "Product reference"}</span><strong>${product.id.toUpperCase()}</strong></div><div class="product-spec-row"><span>${t.warranty}</span><strong>${t.returns}</strong></div><div class="product-spec-row"><span>${optionConfig.label}</span><strong>${escapeHtml(currentOption.label)}</strong></div></div></div>`;
    featureList.after(detailsDisclosure);
    detailsDisclosure.querySelector(
      ".product-spec-row:nth-last-child(3) > span",
    ).textContent = t.productReference;

    const mainImage = root.querySelector("[data-detail-image]");
    const lightbox = root.querySelector("[data-product-lightbox]");
    const lightboxImage = lightbox.querySelector("img");
    const galleryButtons = [...root.querySelectorAll("[data-gallery-image]")];
    let galleryIndex = 0;
    const showGalleryImage = (nextIndex) => {
      galleryIndex = (nextIndex + gallery.length) % gallery.length;
      const selectedImage = gallery[galleryIndex];
      mainImage.classList.add("is-changing");
      window.setTimeout(() => {
        mainImage.src = selectedImage.image;
        mainImage.alt = selectedImage.name;
        root.querySelector(".detail-image-label").textContent =
          selectedImage.name;
        lightboxImage.src = selectedImage.image;
        lightboxImage.alt = selectedImage.name;
        mainImage.classList.remove("is-changing");
      }, 120);
      galleryButtons.forEach((button, index) => {
        button.classList.toggle("is-active", index === galleryIndex);
        button.setAttribute("aria-pressed", String(index === galleryIndex));
      });
    };
    const addGalleryArrow = (container, step, className) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = className;
      button.setAttribute(
        "aria-label",
        step < 0 ? detail.previousImage : detail.nextImage,
      );
      button.innerHTML = icon(step < 0 ? "chevron-left" : "chevron-right");
      container.append(button);
      button.addEventListener("click", () =>
        showGalleryImage(galleryIndex + step),
      );
    };
    addGalleryArrow(
      root.querySelector(".product-detail-image"),
      -1,
      "gallery-arrow is-previous",
    );
    addGalleryArrow(
      root.querySelector(".product-detail-image"),
      1,
      "gallery-arrow is-next",
    );
    addGalleryArrow(lightbox, -1, "lightbox-arrow is-previous");
    addGalleryArrow(lightbox, 1, "lightbox-arrow is-next");
    galleryButtons.forEach((button, index) =>
      button.addEventListener("click", () => showGalleryImage(index)),
    );
    mainImage.addEventListener("click", () => {
      if (mainImage.dataset.suppressClick === "true") {
        mainImage.dataset.suppressClick = "false";
        return;
      }
      lightbox.showModal();
    });
    const enableSwipe = (element) => {
      let startX = null;
      element.addEventListener("pointerdown", (event) => {
        startX = event.clientX;
      });
      element.addEventListener("pointerup", (event) => {
        if (startX === null) return;
        const distance = event.clientX - startX;
        startX = null;
        if (Math.abs(distance) < 45) return;
        showGalleryImage(galleryIndex + (distance < 0 ? 1 : -1));
        if (element === mainImage) {
          mainImage.dataset.suppressClick = "true";
          window.setTimeout(() => {
            mainImage.dataset.suppressClick = "false";
          }, 300);
        }
      });
    };
    enableSwipe(mainImage);
    enableSwipe(lightboxImage);
    lightbox.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") showGalleryImage(galleryIndex + 1);
      if (event.key === "ArrowLeft") showGalleryImage(galleryIndex - 1);
    });
    root.querySelector("[data-gallery-zoom]").addEventListener("click", () => {
      lightbox.querySelector("img").src = root.querySelector(
        "[data-detail-image]",
      ).src;
      lightbox.showModal();
    });
    root
      .querySelector("[data-close-lightbox]")
      .addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) lightbox.close();
    });
    root.querySelector("[data-detail-quantity-value]").textContent =
      productQuantity;
    root.querySelector(".product-detail-rating").innerHTML =
      `${icon("star")} ${reviewScore.toFixed(1)}`;
    root.querySelector(".detail-rating-link > span:nth-child(2)").textContent =
      `${reviewTotal} ${t.rating}`;
    root.querySelector(".rating-panel-score > strong").textContent =
      reviewScore.toFixed(1);
    window.lucide?.createIcons();
    root.querySelector("#product-reviews .commerce-eyebrow").textContent =
      `${reviewTotal} ${t.rating}`;
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    root
      .querySelectorAll(".detail-scroll-reveal")
      .forEach((element) => revealObserver.observe(element));
  }

  function renderWishlist() {
    const saved = store.wishlist().map(productById).filter(Boolean);
    root.innerHTML = `<div class="commerce-heading"><div><span class="commerce-eyebrow">${t.eyebrow}</span><h1>${t.wishlist}</h1><p>${saved.length} ${t.savedCount}</p></div><a class="commerce-button-secondary" href="/products.html">${t.browse}</a></div>${saved.length ? `<section class="commerce-product-grid">${saved.map(productCard).join("")}</section>` : `<section class="commerce-empty">${icon("heart")}<h2>${t.emptyWishTitle}</h2><p>${t.emptyWish}</p><a class="commerce-button" href="/products.html">${t.browse}</a></section>`}`;
  }

  function lineItems() {
    return Object.entries(store.cart())
      .map(([id, quantity]) => {
        const product = productById(id);
        const option = product ? selectedOption(product) : null;
        return {
          product,
          quantity: Number(quantity) || 0,
          option,
          unitPrice: product ? product.price + (option?.adjustment || 0) : 0,
        };
      })
      .filter((line) => line.product && line.quantity > 0);
  }

  function totals(lines = lineItems()) {
    const subtotal = lines.reduce(
      (sum, line) => sum + line.unitPrice * line.quantity,
      0,
    );
    const shipping = subtotal === 0 || subtotal >= 299 ? 0 : 25;
    return { subtotal, shipping, total: subtotal + shipping };
  }

  function summaryMarkup(lines, includeButton = true) {
    const total = totals(lines);
    return `<aside class="summary-panel"><h2>${t.orderSummary}</h2><div class="summary-row"><span>${t.subtotal}</span><strong>${money(total.subtotal)}</strong></div><div class="summary-row"><span>${t.shippingCost}</span><strong>${total.shipping ? money(total.shipping) : t.free}</strong></div><div class="summary-row total"><span>${t.total}</span><strong>${money(total.total)}</strong></div>${includeButton ? `<a class="commerce-button" href="/checkout.html">${t.checkout}</a>` : ""}<p class="summary-note">${t.shippingNote}</p></aside>`;
  }

  function renderCart() {
    const lines = lineItems();
    if (!lines.length) {
      root.innerHTML = `<div class="commerce-heading"><div><span class="commerce-eyebrow">${t.eyebrow}</span><h1>${t.bag}</h1></div></div><section class="commerce-empty">${icon("shopping-bag")}<h2>${t.emptyCartTitle}</h2><p>${t.emptyCart}</p><a class="commerce-button" href="/products.html">${t.continue}</a></section>`;
      return;
    }
    const lineMarkup = lines
      .map(
        ({ product, quantity, option, unitPrice }) =>
          `<article class="cart-line" data-cart-line="${product.id}"><a href="${productUrl(product.id)}"><img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" /></a><div><span class="commerce-product-brand">${escapeHtml(product.brand)}</span><h2><a href="${productUrl(product.id)}">${escapeHtml(product.name)}</a></h2><p>${money(unitPrice)} · ${escapeHtml(option.label)} ${product.stock ? "" : `· ${t.lowStock}`}</p><div class="quantity-control" aria-label="${t.qty}"><button type="button" data-quantity="-1" data-id="${product.id}" aria-label="Decrease quantity">−</button><output>${quantity}</output><button type="button" data-quantity="1" data-id="${product.id}" aria-label="Increase quantity">+</button></div></div><div class="cart-line-end"><strong class="commerce-price">${money(unitPrice * quantity)}</strong><button class="commerce-danger" type="button" data-remove-cart="${product.id}">${icon("trash-2")}<span>${t.remove}</span></button></div></article>`,
      )
      .join("");
    root.innerHTML = `<div class="commerce-heading"><div><span class="commerce-eyebrow">${t.eyebrow}</span><h1>${t.bag}</h1><p>${t.bagIntro}</p></div><a class="commerce-button-secondary" href="/products.html">${t.continue}</a></div><div class="cart-layout"><section class="cart-lines">${lineMarkup}</section>${summaryMarkup(lines)}</div>`;
  }

  function renderCheckout() {
    const lines = lineItems();
    if (!lines.length) {
      root.innerHTML = `<section class="commerce-empty">${icon("shopping-bag")}<h2>${t.emptyCartTitle}</h2><p>${t.emptyCart}</p><a class="commerce-button" href="/products.html">${t.browse}</a></section>`;
      return;
    }
    const profile = store.getProfile();
    root.innerHTML = `<div class="commerce-heading"><div><span class="commerce-eyebrow">${t.eyebrow}</span><h1>${t.checkoutTitle}</h1><p>${t.checkoutIntro}</p></div></div><form class="checkout-layout" data-checkout-form><div class="checkout-sections"><section class="commerce-panel"><h2>${t.contact}</h2><div class="commerce-form-grid"><label class="commerce-field">${t.fullName}<input name="name" autocomplete="name" required value="${escapeHtml(profile.name)}" /></label><label class="commerce-field">${t.email}<input name="email" type="email" autocomplete="email" required value="${escapeHtml(profile.email)}" /></label><label class="commerce-field">${t.phone}<input name="phone" type="tel" autocomplete="tel" inputmode="tel" required value="${escapeHtml(profile.phone)}" /></label><label class="commerce-field">${t.city}<input name="city" autocomplete="address-level2" required value="${escapeHtml(profile.city || t.cityDefault)}" /></label><label class="commerce-field is-wide">${t.address}<input name="address" autocomplete="street-address" required /></label><label class="commerce-field">${t.postal}<input name="postal" autocomplete="postal-code" inputmode="numeric" required /></label><label class="commerce-field is-wide">${t.notes}<textarea name="notes" rows="3"></textarea></label></div></section><section class="commerce-panel"><h2>${t.payment}</h2><div class="payment-options"><label class="payment-option"><input type="radio" name="payment" value="cod" checked /><span>${t.cod}<small>${t.codNote}</small></span></label></div><p class="summary-note">${t.noPayment}</p></section><div class="form-feedback" data-checkout-feedback aria-live="polite"></div><button class="commerce-button" type="submit">${t.confirmOrder}</button></div>${summaryMarkup(lines, false)}</form>`;
  }

  function renderAccount() {
    const profile = store.getProfile();
    const settings = store.getSettings();
    const orders = store.getOrders();
    const orderMarkup = orders.length
      ? orders
          .map(
            (order) =>
              `<div class="order-row"><span><strong>${escapeHtml(order.id)}</strong><small>${escapeHtml(order.date)} · ${order.items.length} ${t.items}</small></span><span><strong>${money(order.total)}</strong><small class="order-status">${t.status}</small></span></div>`,
          )
          .join("")
      : `<div class="commerce-empty">${icon("package-open")}<h2>${t.noOrders}</h2><p>${t.noOrdersNote}</p></div>`;
    root.innerHTML = `<div class="commerce-heading"><div><span class="commerce-eyebrow">${t.eyebrow}</span><h1>${t.account}</h1></div></div><div class="account-layout"><nav class="account-tabs"><a href="#profile" aria-current="page">${t.profile}</a><a href="#settings">${t.settings}</a><a href="#orders">${t.orders}</a></nav><div class="account-content"><section class="commerce-panel" id="profile"><h2>${t.profile}</h2><form class="commerce-form" data-profile-form><div class="commerce-form-grid"><label class="commerce-field">${t.fullName}<input name="name" autocomplete="name" value="${escapeHtml(profile.name)}" /></label><label class="commerce-field">${t.email}<input name="email" type="email" autocomplete="email" value="${escapeHtml(profile.email)}" /></label><label class="commerce-field">${t.phone}<input name="phone" type="tel" autocomplete="tel" value="${escapeHtml(profile.phone)}" /></label><label class="commerce-field">${t.city}<input name="city" value="${escapeHtml(profile.city || t.cityDefault)}" /></label></div><div class="form-feedback" data-profile-feedback aria-live="polite"></div><button class="commerce-button" type="submit">${t.saveProfile}</button></form></section><section class="commerce-panel" id="settings"><h2>${t.settings}</h2><form data-settings-form><label class="settings-row"><span>${t.updates}<small>${t.updatesNote}</small></span><input type="checkbox" name="orderUpdates" ${settings.orderUpdates ? "checked" : ""} /></label><label class="settings-row"><span>${t.offers}<small>${t.offersNote}</small></span><input type="checkbox" name="offers" ${settings.offers ? "checked" : ""} /></label><div class="form-feedback" data-settings-feedback aria-live="polite"></div><button class="commerce-button-secondary" type="submit">${t.saveSettings}</button></form></section><section class="commerce-panel" id="orders"><h2>${t.orders}</h2>${orderMarkup}</section></div></div>`;
  }

  function renderSupport() {
    root.innerHTML = `<div class="commerce-heading"><div><span class="commerce-eyebrow">${t.eyebrow}</span><h1>${t.helpTitle}</h1><p>${t.helpIntro}</p></div></div><nav class="support-anchor-nav"><a href="#faq">${t.faq}</a><a href="#delivery">${t.deliveryTitle}</a><a href="#contact">${t.contactTitle}</a><a href="#terms">${t.terms}</a><a href="#privacy">${t.privacy}</a></nav><section class="support-section" id="faq"><h2>${t.faq}</h2><div class="faq-list"><details><summary>${t.faqDelivery}</summary><p>${t.faqDeliveryAnswer}</p></details><details><summary>${t.faqReturn}</summary><p>${t.faqReturnAnswer}</p></details><details><summary>${t.faqWarranty}</summary><p>${t.faqWarrantyAnswer}</p></details></div></section><section class="support-section" id="delivery"><h2>${t.deliveryTitle}</h2><p>${t.deliveryBody}</p></section><section class="support-section" id="payment"><h2>${t.paymentsTitle}</h2><p>${t.paymentsBody}</p></section><section class="support-section" id="returns"><h2>${t.returnsTitle}</h2><p>${t.returnsBody}</p></section><section class="support-section" id="account-help"><h2>${t.accountTitle}</h2><p>${t.accountBody}</p></section><section class="support-section contact-layout" id="contact"><div><h2>${t.contactTitle}</h2><p>${t.contactIntro}</p><form class="commerce-form" data-contact-form><label class="commerce-field">${t.fullName}<input name="name" required /></label><label class="commerce-field">${t.email}<input name="email" type="email" required /></label><label class="commerce-field">${t.message}<textarea name="message" required></textarea></label><div class="form-feedback" data-contact-feedback aria-live="polite"></div><button class="commerce-button" type="submit">${t.sendMessage}</button></form></div><div class="contact-details"><strong>${t.support}</strong><a href="tel:+966500000000">${t.supportPhone}</a><a href="mailto:hello@noursstore.com">${t.supportEmail}</a><span>${t.cityDefault}</span></div></section><section class="support-section" id="terms"><h2>${t.termsTitle}</h2><p>${t.termsBody}</p></section><section class="support-section" id="privacy"><h2>${t.privacyTitle}</h2><p>${t.privacyBody}</p></section>`;
  }

  function renderAbout() {
    root.innerHTML = `<section class="about-page-hero"><span class="commerce-eyebrow">RUQO TECH · ${t.about}</span><h1>${t.aboutTitle}</h1><p>${t.aboutIntro}</p></section><section class="about-story"><div class="about-story-index">01 / RUQO TECH</div><div><h2>${language === "ar" ? "اختيارات أوضح، وتجربة يمكن الوثوق بها." : "Clearer choices. A store you can trust."}</h2><p>${t.aboutStory}</p><a class="commerce-button" href="/products.html">${t.browse}</a></div></section><section class="about-values"><span class="commerce-eyebrow">${language === "ar" ? "ما نؤمن به" : "WHAT WE VALUE"}</span><div>${t.aboutValues.map((value, index) => `<article><span>0${index + 1}</span><h3>${value}</h3></article>`).join("")}</div></section><section class="about-contact"><div><span class="commerce-eyebrow">${language === "ar" ? "نحن هنا لمساعدتك" : "HERE WHEN YOU NEED US"}</span><h2>${t.support}</h2><p>${t.helpIntro}</p></div><a class="commerce-button-secondary" href="/support.html#contact">${t.contactTitle} ${icon("arrow-up-left")}</a></section>`;
  }

  function render() {
    renderShell();
    document.documentElement.lang = language === "zh" ? "zh-CN" : language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("is-english", language === "en");
    if (page === "product") renderProduct();
    else if (page === "wishlist") renderWishlist();
    else if (page === "cart") renderCart();
    else if (page === "checkout") renderCheckout();
    else if (page === "account") renderAccount();
    else if (page === "about") {
      renderAbout();
      root.querySelector(".about-story h2").textContent = t.aboutStoryTitle;
      root.querySelector(".about-values > .commerce-eyebrow").textContent =
        t.aboutValuesTitle;
      root.querySelector(".about-contact .commerce-eyebrow").textContent =
        t.aboutContactEyebrow;
    }
    else renderSupport();
    if (page === "checkout" || page === "account") {
      const cityInput = root.querySelector('input[name="city"]');
      if (cityInput?.value === "Riyadh") cityInput.value = t.cityDefault;
    }
    if (page === "cart") {
      root.querySelectorAll('[data-quantity="-1"]').forEach((button) =>
        button.setAttribute("aria-label", t.decreaseQuantity),
      );
      root.querySelectorAll('[data-quantity="1"]').forEach((button) =>
        button.setAttribute("aria-label", t.increaseQuantity),
      );
    }
    const pageTitles = {
      cart: { en: "Your bag", fr: "Panier", es: "Carrito", zh: "购物袋", ar: "السلة" },
      wishlist: { en: "Wishlist", fr: "Favoris", es: "Favoritos", zh: "心愿单", ar: "المفضلة" },
      checkout: { en: "Checkout", fr: "Commande", es: "Finalizar compra", zh: "结账", ar: "إتمام الطلب" },
      account: { en: "Account & settings", fr: "Compte et préférences", es: "Cuenta y preferencias", zh: "账户与偏好", ar: "الحساب والتفضيلات" },
      support: { en: "Help & policies", fr: "Aide et politiques", es: "Ayuda y políticas", zh: "帮助与政策", ar: "المساعدة والسياسات" },
      about: { en: "About RUQO TECH", fr: "À propos de RUQO TECH", es: "Sobre RUQO TECH", zh: "关于 RUQO TECH", ar: "من نحن" },
    };
    if (pageTitles[page]) document.title = `${pageTitles[page][language]} | RUQO TECH`;
    window.lucide?.createIcons();
    if (location.hash) {
      requestAnimationFrame(() => {
        document
          .getElementById(decodeURIComponent(location.hash.slice(1)))
          ?.scrollIntoView();
      });
    }
  }

  root.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add]");
    const toggleWish = event.target.closest("[data-toggle-wish]");
    const removeWish = event.target.closest("[data-remove-wish]");
    const removeCart = event.target.closest("[data-remove-cart]");
    const quantityButton = event.target.closest("[data-quantity]");
    const detailQuantity = event.target.closest("[data-detail-quantity]");
    if (detailQuantity) {
      productQuantity = Math.max(
        1,
        Math.min(
          99,
          productQuantity + Number(detailQuantity.dataset.detailQuantity),
        ),
      );
      root.querySelector("[data-detail-quantity-value]").textContent =
        productQuantity;
    }
    if (addButton) {
      const doAddToCart = () => {
        const product = productById(addButton.dataset.add);
        if (product?.stock) {
          const quantity = page === "product" ? productQuantity : 1;
          const option = selectedOption(product);
          const unitPrice = product.price + (page === "product" ? option.adjustment : 0);
          store.addToCart(product.id, quantity);
          store.showAddedToBag(product, { quantity, price: money(unitPrice) });
          if (page === "cart" || page === "wishlist") render();
        }
      };

      if (window.RUQO_SUPABASE_READY && !window.NoursData?.loaded) {
        addButton.disabled = true;
        window.RUQO_SUPABASE_READY.finally(() => {
          addButton.disabled = false;
          doAddToCart();
        });
      } else {
        doAddToCart();
      }
    }
    if (toggleWish) {
      const id = toggleWish.dataset.toggleWish;
      store.toggleWishlist(id);
      render();
    }
    if (removeWish) {
      store.setWishlist(
        store.wishlist().filter((id) => id !== removeWish.dataset.removeWish),
      );
      render();
    }
    if (removeCart) {
      store.removeFromCart(removeCart.dataset.removeCart);
      renderCart();
    }
    if (quantityButton) {
      const id = quantityButton.dataset.id;
      store.setQuantity(
        id,
        (Number(store.cart()[id]) || 0) +
          Number(quantityButton.dataset.quantity),
      );
      renderCart();
    }
  });

  root.addEventListener("submit", async (event) => {
    if (event.target.matches("[data-product-review]")) {
      event.preventDefault();
      const form = event.target;
      if (!form.reportValidity()) return;
      const review = Object.fromEntries(new FormData(form));
      const key = `nours-reviews-${new URLSearchParams(location.search).get("id")}`;
      store.write(key, [
        ...store.read(key, []),
        {
          name: review.name.trim(),
          text: review.text.trim(),
          rating: Number(review.rating),
          date: new Date().toISOString(),
        },
      ]);
      renderProduct();
      root
        .querySelector("#product-reviews")
        ?.scrollIntoView({ behavior: "smooth" });
      toast(t.reviewThanks);
    }
    if (event.target.matches("[data-checkout-form]")) {
      event.preventDefault();
      const form = event.target;
      if (!form.reportValidity()) return;
      const values = Object.fromEntries(new FormData(form));
      const feedback = root.querySelector("[data-checkout-feedback]");
      const submitButton = form.querySelector('[type="submit"]');
      const config = window.RUQO_SUPABASE_CONFIG;
      if (!config?.publishableKey || !window.RUQO_SUPABASE) {
        feedback.textContent = t.checkoutUnavailable;
        return;
      }
      if (values.payment !== "cod") {
        feedback.textContent = t.checkoutFailed;
        return;
      }

      const lines = lineItems();
      if (!lines.length) {
        renderCheckout();
        return;
      }
      const items = lines.map(({ product, quantity, option }) => ({
        product_slug: product.slug || product.id,
        variant_key:
          product.variants?.find((variant) => variant.option_value === option.canonicalLabel)?.variant_key || null,
        quantity,
      }));
      submitButton.disabled = true;
      feedback.textContent = "";
      try {
        const { data, error } = await window.RUQO_SUPABASE.functions.invoke(
          "create-guest-order",
          {
            body: {
              customer: {
                name: values.name,
                email: values.email,
                phone: values.phone,
                city: values.city,
                address: values.address,
                postal: values.postal,
                notes: values.notes,
                language,
              },
              items,
            },
          },
        );
        if (error) {
          let serverMessage = "";
          try {
            serverMessage = (await error.context.json()).error || "";
          } catch {
            serverMessage = "";
          }
          throw new Error(serverMessage || t.checkoutFailed);
        }
        if (!data?.order?.order_number) throw new Error(t.checkoutFailed);

        const order = data.order;
        store.setProfile({
          name: values.name,
          email: values.email,
          phone: values.phone,
          city: values.city,
        });
        store.setOrders([
          {
            id: order.order_number,
            date: new Intl.DateTimeFormat(localeByLanguage[language] || localeByLanguage.en, {
              dateStyle: "medium",
            }).format(new Date()),
            items: lines.map(({ product, quantity, option, unitPrice }) => ({
              id: product.id,
              name: product.name,
              quantity,
              variant: option.label,
              price: unitPrice,
            })),
            total: Number(order.total),
            status: order.status,
            payment: "cod",
            address: values.address,
            city: values.city,
          },
          ...store.getOrders(),
        ]);
        Object.keys(store.cart()).forEach((id) => store.removeFromCart(id));
        root.innerHTML = `<section class="commerce-empty">${icon("badge-check")}<span class="commerce-eyebrow">${t.orderPlaced}</span><h1>${t.thankYou}</h1><p>${t.orderNumber}: <strong>${escapeHtml(order.order_number)}</strong></p><p>${t.total}: <strong>${money(Number(order.total))}</strong></p><a class="commerce-button" href="/account.html#orders">${t.viewAccount}</a><a class="commerce-button-secondary" href="/products.html">${t.continue}</a></section>`;
        window.lucide?.createIcons();
      } catch (error) {
        feedback.textContent = error.message || t.checkoutFailed;
        submitButton.disabled = false;
      }
    }
    if (event.target.matches("[data-profile-form]")) {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.target));
      store.setProfile({ ...store.getProfile(), ...values });
      root.querySelector("[data-profile-feedback]").textContent =
        t.profileSaved;
    }
    if (event.target.matches("[data-settings-form]")) {
      event.preventDefault();
      store.setSettings({
        orderUpdates: event.target.elements.orderUpdates.checked,
        offers: event.target.elements.offers.checked,
      });
      root.querySelector("[data-settings-feedback]").textContent =
        t.settingsSaved;
    }
    if (event.target.matches("[data-contact-form]")) {
      event.preventDefault();
      if (event.target.reportValidity()) {
        root.querySelector("[data-contact-feedback]").textContent =
          t.messageSent;
        event.target.reset();
      }
    }
  });

  render();
  window.addEventListener("ruqo:currency-updated", render);
  window.addEventListener("ruqo:catalog-updated", render);
  window.RUQO_SUPABASE_READY?.then((loaded) => {
    if (loaded) render();
  });
})();
