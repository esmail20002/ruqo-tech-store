(() => {
  const VAT_RATE = 0.15;
  const verificationPageUrl = new URL("../invoice-verify.html",
    window.document?.currentScript?.src || new URL("/js/invoice-generator.js", window.location.origin));

  const INVOICE_I18N = {
    ar: {
      dir: "rtl",
      lang: "ar",
      docTitle: "فاتورة ضريبية رسمية | WEEXEY",
      previewBarTitle: "معاينة الفاتورة الضريبية الرسمية المعتمدة",
      previewBarSub: "مستند قانوني رسمي مهيأ في صفحة A4 واحدة — جاهز للتحميل المباشر بصيغة PDF",
      downloadPdfBtn: "تحميل الفاتورة PDF (صفحة واحدة)",
      downloadingBtn: "جارٍ تجهيز ملف PDF...",
      printNowBtn: "طباعة",
      closePreviewBtn: "إغلاق المعاينة",
      companyLegalName: "شركة ويكسي للتجارة والتقنية المحدودة",
      companyBranch: "المركز الإقليمي للتوزيع والخدمات اللوجستية — الرياض، المملكة العربية السعودية",
      companyAddress: "طريق الملك فهد، مركز الملك عبدالله المالي (KAFD)، برج الأعمال 4، الرمز البريدي 13519",
      crLabel: "السجل التجاري (CR)",
      crNumber: "1010894521",
      trnLabel: "الرقم الضريبي (VAT / TRN)",
      trnNumber: "310489275600003",
      supportEmailLabel: "البريد الرسمي",
      supportEmail: "legal-billing@weexey.com",
      invoiceBadge: "مستند ضريبي رسمي معتمد",
      invoiceMainTitle: "فاتورة ضريبية وشهادة ضمان",
      invoiceSubtitle: "OFFICIAL TAX INVOICE & WARRANTY CERTIFICATE",
      metaInvoiceNo: "رقم الفاتورة الضريبية",
      metaOrderNo: "رقم الطلب المرجعي",
      metaIssueDate: "تاريخ ووقت الإصدار",
      metaPaymentMethod: "طريقة السداد المعتمدة",
      metaPaymentVal: "الدفع عند الاستلام (نقداً / شبكة مدى / بطاقة ائتمانية)",
      metaSupplyDate: "تاريخ التوريد المتوقع",
      metaSupplyVal: "خلال 1–2 يوم عمل من تاريخ الإصدار",
      metaCurrency: "عملة الفاتورة",
      statusConfirmed: "مؤكدة ومعتمدة للتوريد",
      statusShipped: "قيد الشحن والتوريد",
      statusDelivered: "تم التسليم والتحصيل",
      statusCancelled: "ملغاة (مستند مرجعي)",
      sellerBoxTitle: "بيانات المُورِّد (البائع الرسمي)",
      buyerBoxTitle: "بيانات العميل وعنوان التسليم القانوني",
      customerNameLabel: "اسم العميل / المستلم",
      customerPhoneLabel: "رقم الهاتف الموثق",
      customerEmailLabel: "البريد الإلكتروني",
      customerCityLabel: "المدينة / المنطقة",
      customerAddressLabel: "عنوان التسليم التفصيلي",
      customerNotesLabel: "تعليمات التسليم المرفقة",
      notProvided: "غير محدد",
      tableSectionTitle: "بيان السلع والمنتجات الخاضعة للضريبة",
      colIndex: "#",
      colSku: "رمز الصنف (SKU)",
      colDescription: "البيان ومواصفات المنتج",
      colQty: "الكمية",
      colUnitExcl: "سعر الوحدة (قبل الضريبة)",
      colVatRate: "نسبة الضريبة",
      colVatAmount: "قيمة الضريبة (15%)",
      colLineTotal: "الإجمالي (شامل الضريبة)",
      serialWarrantyNote: "مشمول بالضمان الرسمي لمدة 24 شهراً",
      summarySectionTitle: "الملخص المالي والضريبي",
      sumExclVat: "إجمالي المبلغ الخاضع للضريبة (غير شامل ضريبة القيمة المضافة)",
      sumDiscount: "إجمالي الخصومات والعروض الترويجية",
      sumShipping: "رسوم الشحن والتوصيل اللوجستي السريع",
      sumFreeShipping: "مجاناً (0.00)",
      sumVatTotal: "إجمالي ضريبة القيمة المضافة (15% مدمجة)",
      sumGrandTotal: "صافي القيمة الإجمالية المستحقة (شامل الضريبة)",
      sumCodNote: "المبلغ المطلوب تحصيله عند التسليم (COD):",
      verificationBoxTitle: "التحقق من سجل الفاتورة",
      qrCaption: "امسح الرمز أو اضغط عليه للتحقق من رقم الفاتورة وتاريخها وحالة الطلب في المتجر، دون عرض بيانات العميل.",
      qrUnavailable: "التحقق الإلكتروني غير متاح لهذه المعاينة أو الفاتورة.",
      authCodeLabel: "مرجع الفاتورة:",
      policiesHeaderTitle: "السياسات القانونية وشروط الضمان والاسترجاع والاستلام المعتمدة",
      policiesHeaderCode: "DOCUMENT REF: WX-LEGAL-2026-REV4",
      policy1Title: "1. سياسة الضمان الذهبي الشامل (لمدة سنتين / 24 شهراً)",
      policy1Body:
        "تضمن شركة WEEXEY جميع الأجهزة والمنتجات الإلكترونية المباعة بموجب هذه الفاتورة لمدة أربعة وعشرين (24) شهراً من تاريخ الاستلام الفعلي ضد كافة العيوب المصنعية والأعطال الفنية غير الناتجة عن سوء الاستخدام. تُعد هذه الفاتورة الضريبية بمثابة شهادة ضمان رسمية معتمدة، ويلزم إبراز رقمها عند طلب الصيانة أو الاستبدال الضماني. لا يشمل الضمان الكسر العرضي، السوائل، أو التعديلات غير المصرح بها.",
      policy2Title: "2. سياسة الاستبدال والاسترجاع القانونية (خلال 7 أيام)",
      policy2Body:
        "يحق للعميل طلب استرجاع أو استبدال المنتجات خلال سبعة (7) أيام تقويمية من تاريخ الاستلام، شريطة أن يكون المنتج في حالته الأصلية تماماً، غير مستخدم، وبغلافه المصنعي الأصلي المختوم مع كامل الملحقات والكتيبات والهدايا المرفقة. يتم رد المبلغ كاملاً بنفس وسيلة الدفع المعتمدة بعد اجتياز الفحص الفني في مراكز WEEXEY خلال 3 إلى 5 أيام عمل.",
      policy3Title: "3. إقرار المعاينة والاستلام عند الدفع عند الاستلام (COD)",
      policy3Body:
        "يلتزم مندوب التوصيل المعتمد بتسليم الشحنة مغلفة ومختومة بختم الأمان الخاص بـ WEEXEY. يحق للعميل التحقق من سلامة العبوة الخارجية ومطابقة الصنف قبل إتمام السداد. يُعد توقيع العميل على جهاز المندوب أو سداد قيمة الفاتورة بمثابة إقرار قانوني باستلام المنتجات بحالة سليمة وخالية من أي تلف ظاهري.",
      policy4Title: "4. الحجية القانونية للفاتورة الإلكترونية",
      policy4Body:
        "هذه فاتورة مولدة إلكترونياً. رمز QR يتحقق من سجل الطلب في المتجر فقط، ولا يثبت بمفرده الامتثال الضريبي أو استحقاق الضمان أو صحة جميع محتويات نسخة الفاتورة.",
      sigSellerTitle: "الاعتماد والختم الرسمي للشركة",
      sigSellerRole: "إدارة العمليات والفوترة القانونية — WEEXEY",
      sigStampTop: "شركة ويكسي للتجارة",
      sigStampCenter: "معتمد رسمياً · VERIFIED",
      sigStampBottom: "CR: 1010894521 · VAT",
      sigBuyerTitle: "إقرار استلام العميل (عند التسليم)",
      sigBuyerNameLine: "اسم المستلم:",
      sigBuyerSignLine: "التوقيع عند الاستلام:",
      sigBuyerDateLine: "تاريخ الاستلام الفعلي:",
      footerLegalLine:
        "جميع الحقوق محفوظة © WEEXEY Commerce Ltd. — مستند قانوني صادر آلياً وموثق في السجل الرقمي للمتجر.",
      pageIndicator: "صفحة 1 من 1",
    },
    en: {
      dir: "ltr",
      lang: "en",
      docTitle: "Official Tax Invoice | WEEXEY",
      previewBarTitle: "Official Legal Tax Invoice Preview",
      previewBarSub: "Single-page A4 legal document — ready for 1-click direct PDF download",
      downloadPdfBtn: "Download Invoice PDF (1 Page)",
      downloadingBtn: "Generating PDF...",
      printNowBtn: "Print",
      closePreviewBtn: "Close Preview",
      companyLegalName: "WEEXEY Commerce & Technology Ltd.",
      companyBranch: "Regional Fulfillment & Corporate Operations HQ — Riyadh, KSA",
      companyAddress: "King Fahd Road, King Abdullah Financial District (KAFD), Tower 4, Postal Code 13519",
      crLabel: "Commercial Reg. (CR)",
      crNumber: "1010894521",
      trnLabel: "Tax Reg. Number (VAT / TRN)",
      trnNumber: "310489275600003",
      supportEmailLabel: "Official Billing Email",
      supportEmail: "legal-billing@weexey.com",
      invoiceBadge: "CERTIFIED LEGAL TAX DOCUMENT",
      invoiceMainTitle: "OFFICIAL TAX INVOICE",
      invoiceSubtitle: "COMMERCIAL BILL OF SALE & 2-YEAR WARRANTY CERTIFICATE",
      metaInvoiceNo: "Tax Invoice No.",
      metaOrderNo: "Order Reference No.",
      metaIssueDate: "Date & Time of Issue",
      metaPaymentMethod: "Authorized Payment Method",
      metaPaymentVal: "Cash / Card on Delivery (COD)",
      metaSupplyDate: "Estimated Fulfillment",
      metaSupplyVal: "Within 1–2 Business Days from Issue",
      metaCurrency: "Invoice Currency",
      statusConfirmed: "Confirmed & Authorized",
      statusShipped: "Dispatched / In Transit",
      statusDelivered: "Delivered & Settled",
      statusCancelled: "Cancelled (Reference Copy)",
      sellerBoxTitle: "Issued By (Authorized Seller)",
      buyerBoxTitle: "Billed & Shipped To (Customer)",
      customerNameLabel: "Recipient / Customer Name",
      customerPhoneLabel: "Verified Phone Number",
      customerEmailLabel: "Email Address",
      customerCityLabel: "City / Region",
      customerAddressLabel: "Registered Delivery Address",
      customerNotesLabel: "Courier Delivery Instructions",
      notProvided: "N/A",
      tableSectionTitle: "Itemized Schedule of Taxable Goods & Hardware",
      colIndex: "#",
      colSku: "Item SKU",
      colDescription: "Product Description & Specifications",
      colQty: "Qty",
      colUnitExcl: "Unit Price (Excl. VAT)",
      colVatRate: "VAT Rate",
      colVatAmount: "VAT Amount (15%)",
      colLineTotal: "Line Total (Incl. VAT)",
      serialWarrantyNote: "Covered by Official 24-Month Regional Warranty",
      summarySectionTitle: "Financial & Tax Breakdown",
      sumExclVat: "Total Taxable Subtotal (Excluding VAT)",
      sumDiscount: "Promotional Discounts & Rebates",
      sumShipping: "Express Insured Courier & Logistics",
      sumFreeShipping: "FREE (0.00)",
      sumVatTotal: "Total Value Added Tax (15% Inclusive)",
      sumGrandTotal: "Grand Total Payable (Including VAT)",
      sumCodNote: "Net Amount Collectible Upon Delivery (COD):",
      verificationBoxTitle: "Invoice record verification",
      qrCaption: "Scan or click to check the invoice number, date and order status in the store, without exposing customer details.",
      qrUnavailable: "Online verification is unavailable for this preview or invoice.",
      authCodeLabel: "Invoice reference:",
      policiesHeaderTitle: "STATUTORY TERMS, WARRANTY COVERAGE, RETURN POLICY & DELIVERY ACKNOWLEDGMENT",
      policiesHeaderCode: "DOCUMENT REF: WX-LEGAL-2026-REV4",
      policy1Title: "1. Official 2-Year (24-Month) Comprehensive Manufacturer & Store Warranty",
      policy1Body:
        "WEEXEY Commerce & Technology Ltd. warrants all hardware and electronic items listed on this invoice for twenty-four (24) months from the date of delivery against manufacturing defects and internal hardware malfunctions under normal use. This Official Tax Invoice serves as your mandatory legal Warranty Certificate. Accidental damage, liquid ingress, unauthorized repairs, and normal wear are excluded.",
      policy2Title: "2. 7-Day Statutory Return & Exchange Policy",
      policy2Body:
        "Eligible items may be returned or exchanged within seven (7) calendar days of receipt, strictly provided that the merchandise remains unused, undamaged, and in its original factory-sealed packaging with all original accessories, manuals, and promotional bundles intact. Refunds are processed within 3–5 business days following technical quality inspection at WEEXEY fulfillment centers.",
      policy3Title: "3. Cash on Delivery (COD) Inspection & Handover Protocol",
      policy3Body:
        "All shipments are dispatched with tamper-evident WEEXEY security seals. The recipient is entitled to verify the external integrity of the parcel and confirm the order reference number prior to completing payment to the courier. Remitting payment or signing the courier Proof of Delivery (POD) constitutes formal legal acknowledgment of receiving the goods in intact external condition.",
      policy4Title: "4. Legal Validity of Electronic Tax Invoice",
      policy4Body:
        "This invoice is electronically generated. The QR checks the store order record only; it does not independently certify tax compliance, warranty eligibility or all contents of an invoice copy.",
      sigSellerTitle: "Authorized Corporate Seal & Issuance",
      sigSellerRole: "Legal Billing & Compliance Division — WEEXEY",
      sigStampTop: "WEEXEY COMMERCE LTD",
      sigStampCenter: "OFFICIAL TAX SEAL",
      sigStampBottom: "CR: 1010894521 · VAT",
      sigBuyerTitle: "Customer Delivery Acknowledgment (POD)",
      sigBuyerNameLine: "Received By (Name):",
      sigBuyerSignLine: "Recipient Signature:",
      sigBuyerDateLine: "Date of Delivery:",
      footerLegalLine:
        "© WEEXEY Commerce & Technology Ltd. All Rights Reserved — Electronically audited legal tax invoice.",
      pageIndicator: "Page 1 of 1",
    },
    fr: {
      dir: "ltr",
      lang: "fr",
      docTitle: "Facture Fiscale Officielle | WEEXEY",
      previewBarTitle: "Aperçu de la Facture Fiscale Officielle",
      previewBarSub: "Document légal A4 sur une seule page — téléchargement PDF direct",
      downloadPdfBtn: "Télécharger la Facture PDF",
      downloadingBtn: "Génération du PDF...",
      printNowBtn: "Imprimer",
      closePreviewBtn: "Fermer l’aperçu",
      companyLegalName: "WEEXEY Commerce & Technology Ltd.",
      companyBranch: "Centre Régional de Distribution et d’Opérations — Riyad",
      companyAddress: "King Fahd Road, Quartier Financier KAFD, Tour 4, Code Postal 13519",
      crLabel: "Registre du Commerce (RC)",
      crNumber: "1010894521",
      trnLabel: "N° d’Identification Fiscale (TVA)",
      trnNumber: "310489275600003",
      supportEmailLabel: "E-mail Facturation",
      supportEmail: "legal-billing@weexey.com",
      invoiceBadge: "DOCUMENT FISCAL OFFICIEL CERTIFIÉ",
      invoiceMainTitle: "FACTURE FISCALE OFFICIELLE",
      invoiceSubtitle: "ACTE DE VENTE ET CERTIFICAT DE GARANTIE DE 2 ANS",
      metaInvoiceNo: "N° de Facture",
      metaOrderNo: "N° de Commande",
      metaIssueDate: "Date d’émission",
      metaPaymentMethod: "Mode de Paiement",
      metaPaymentVal: "Paiement à la livraison (Espèces / Carte)",
      metaSupplyDate: "Délai de livraison prévu",
      metaSupplyVal: "Sous 1 à 2 jours ouvrables",
      metaCurrency: "Devise",
      statusConfirmed: "Confirmée et Autorisée",
      statusShipped: "En cours d’expédition",
      statusDelivered: "Livrée et Réglée",
      statusCancelled: "Annulée (Copie de référence)",
      sellerBoxTitle: "Émetteur (Vendeur Officiel)",
      buyerBoxTitle: "Facturé et Livré à (Client)",
      customerNameLabel: "Nom du destinataire",
      customerPhoneLabel: "Téléphone vérifié",
      customerEmailLabel: "Adresse e-mail",
      customerCityLabel: "Ville / Région",
      customerAddressLabel: "Adresse de livraison",
      customerNotesLabel: "Instructions de livraison",
      notProvided: "Non renseigné",
      tableSectionTitle: "Détail des Articles et Équipements Taxables",
      colIndex: "#",
      colSku: "Réf. SKU",
      colDescription: "Désignation et Spécifications",
      colQty: "Qté",
      colUnitExcl: "Prix Unitaire (HT)",
      colVatRate: "Taux TVA",
      colVatAmount: "Montant TVA (15%)",
      colLineTotal: "Total TTC",
      serialWarrantyNote: "Couvert par la Garantie Officielle de 24 Mois",
      summarySectionTitle: "Récapitulatif Financier et Fiscal",
      sumExclVat: "Sous-total Hors Taxes (HT)",
      sumDiscount: "Remises et Promotions",
      sumShipping: "Livraison Express Assurée",
      sumFreeShipping: "GRATUIT (0.00)",
      sumVatTotal: "Total TVA (15% incluse)",
      sumGrandTotal: "Total Général TTC à Payer",
      sumCodNote: "Montant net à encaisser à la livraison (COD) :",
      verificationBoxTitle: "Vérification du registre de facture",
      qrCaption: "Scannez ou cliquez pour vérifier le numéro, la date et le statut de la commande, sans afficher les données du client.",
      qrUnavailable: "La vérification en ligne est indisponible pour cet aperçu ou cette facture.",
      authCodeLabel: "Référence de facture :",
      policiesHeaderTitle: "CONDITIONS LÉGALES, GARANTIE DE 2 ANS, POLITIQUE DE RETOUR (7 JOURS) ET RÉCEPTION",
      policiesHeaderCode: "DOCUMENT REF: WX-LEGAL-2026-REV4",
      policy1Title: "1. Garantie Officielle Complète de 2 Ans (24 Mois)",
      policy1Body:
        "WEEXEY garantit tous les produits figurant sur cette facture pendant vingt-quatre (24) mois à compter de la livraison contre tout défaut de fabrication. Cette facture fait foi de certificat de garantie officiel. Les dommages accidentels, l’oxydation et l’usure normale sont exclus.",
      policy2Title: "2. Droit de Retour et d’Échange sous 7 Jours",
      policy2Body:
        "Les articles éligibles peuvent être retournés ou échangés dans un délai de sept (7) jours calendaires suivant la réception, à condition qu’ils soient neufs, non utilisés et dans leur emballage d’origine scellé avec tous les accessoires.",
      policy3Title: "3. Protocole de Vérification et Paiement à la Livraison (COD)",
      policy3Body:
        "Chaque colis est expédié avec un scellé de sécurité WEEXEY. Le client peut vérifier l’état extérieur du colis avant le règlement. Le paiement au livreur vaut accusé de réception conforme.",
      policy4Title: "4. Validité Juridique de la Facture Électronique",
      policy4Body:
        "Facture générée électroniquement. Le QR vérifie uniquement le registre de commande, pas la conformité fiscale, le droit à la garantie ou l’ensemble du contenu d’une copie.",
      sigSellerTitle: "Cachet Officiel et Validation",
      sigSellerRole: "Direction de la Facturation Légale — WEEXEY",
      sigStampTop: "WEEXEY COMMERCE LTD",
      sigStampCenter: "CERTIFIÉ · VERIFIED",
      sigStampBottom: "RC: 1010894521 · TVA",
      sigBuyerTitle: "Accusé de Réception Client",
      sigBuyerNameLine: "Reçu par :",
      sigBuyerSignLine: "Signature du client :",
      sigBuyerDateLine: "Date de réception :",
      footerLegalLine:
        "© WEEXEY Commerce & Technology Ltd. Tous droits réservés — Facture fiscale électronique certifiée.",
      pageIndicator: "Page 1 sur 1",
    },
    es: {
      dir: "ltr",
      lang: "es",
      docTitle: "Factura Fiscal Oficial | WEEXEY",
      previewBarTitle: "Vista Previa de Factura Fiscal Oficial",
      previewBarSub: "Documento legal A4 en una sola página — descarga directa en PDF",
      downloadPdfBtn: "Descargar Factura PDF",
      downloadingBtn: "Generando PDF...",
      printNowBtn: "Imprimir",
      closePreviewBtn: "Cerrar Vista Previa",
      companyLegalName: "WEEXEY Commerce & Technology Ltd.",
      companyBranch: "Sede Regional de Operaciones y Logística — Riad",
      companyAddress: "King Fahd Road, Distrito Financiero KAFD, Torre 4, Código Postal 13519",
      crLabel: "Registro Mercantil (CR)",
      crNumber: "1010894521",
      trnLabel: "NIF / Registro de IVA (TRN)",
      trnNumber: "310489275600003",
      supportEmailLabel: "Correo de Facturación",
      supportEmail: "legal-billing@weexey.com",
      invoiceBadge: "DOCUMENTO FISCAL OFICIAL CERTIFICADO",
      invoiceMainTitle: "FACTURA FISCAL OFICIAL",
      invoiceSubtitle: "COMPROBANTE LEGAL DE VENTA Y CERTIFICADO DE GARANTÍA DE 2 AÑOS",
      metaInvoiceNo: "N° de Factura",
      metaOrderNo: "N° de Pedido",
      metaIssueDate: "Fecha de Emisión",
      metaPaymentMethod: "Método de Pago",
      metaPaymentVal: "Pago Contra Entrega (Efectivo / Tarjeta)",
      metaSupplyDate: "Entrega Estimada",
      metaSupplyVal: "1–2 días hábiles desde la emisión",
      metaCurrency: "Moneda",
      statusConfirmed: "Confirmada y Autorizada",
      statusShipped: "En Tránsito / Enviado",
      statusDelivered: "Entregado y Pagado",
      statusCancelled: "Cancelada (Copia de referencia)",
      sellerBoxTitle: "Emitido Por (Vendedor Autorizado)",
      buyerBoxTitle: "Facturado y Enviado a (Cliente)",
      customerNameLabel: "Nombre del Destinatario",
      customerPhoneLabel: "Teléfono de Contacto",
      customerEmailLabel: "Correo Electrónico",
      customerCityLabel: "Ciudad / Región",
      customerAddressLabel: "Dirección de Entrega",
      customerNotesLabel: "Instrucciones de Entrega",
      notProvided: "No especificado",
      tableSectionTitle: "Detalle de Productos y Artículos Sujetos a Impuestos",
      colIndex: "#",
      colSku: "Código SKU",
      colDescription: "Descripción y Especificaciones del Producto",
      colQty: "Cant.",
      colUnitExcl: "Precio Unit. (Sin IVA)",
      colVatRate: "Tasa IVA",
      colVatAmount: "Importe IVA (15%)",
      colLineTotal: "Total Línea (IVA Incl.)",
      serialWarrantyNote: "Cubierto por Garantía Oficial de 24 Meses",
      summarySectionTitle: "Desglose Financiero y Fiscal",
      sumExclVat: "Subtotal Base Imponible (Sin IVA)",
      sumDiscount: "Descuentos Promocionales",
      sumShipping: "Envío Exprés Asegurado",
      sumFreeShipping: "GRATIS (0.00)",
      sumVatTotal: "Total Impuesto al Valor Agregado (15% incluido)",
      sumGrandTotal: "Total General a Pagar (IVA Incluido)",
      sumCodNote: "Importe neto a cobrar en la entrega (COD):",
      verificationBoxTitle: "Verificación del registro de factura",
      qrCaption: "Escanee o pulse para consultar el número, la fecha y el estado del pedido, sin mostrar datos del cliente.",
      qrUnavailable: "La verificación en línea no está disponible para esta vista previa o factura.",
      authCodeLabel: "Referencia de factura:",
      policiesHeaderTitle: "TÉRMINOS LEGALES, GARANTÍA DE 2 AÑOS, DEVOLUCIONES (7 DÍAS) Y PROTOCOLO DE ENTREGA",
      policiesHeaderCode: "DOCUMENT REF: WX-LEGAL-2026-REV4",
      policy1Title: "1. Garantía Oficial Integral de 2 Años (24 Meses)",
      policy1Body:
        "WEEXEY garantiza todos los productos detallados en esta factura durante veinticuatro (24) meses a partir de la recepción contra defectos de fabricación. Esta Factura Fiscal actúa como Certificado de Garantía Oficial obligatorio. No cubre daños accidentales, líquidos ni desgaste normal.",
      policy2Title: "2. Política Legal de Devolución y Cambio de 7 Días",
      policy2Body:
        "Los artículos elegibles pueden devolverse o cambiarse dentro de los siete (7) días naturales posteriores a la entrega, siempre que estén sin usar y en su empaque original sellado con todos sus accesorios.",
      policy3Title: "3. Protocolo de Inspección y Pago Contra Entrega (COD)",
      policy3Body:
        "Todos los pedidos se envían con precintos de seguridad WEEXEY. El destinatario puede verificar la integridad exterior del paquete antes de pagar. El pago o firma al transportista confirma la recepción conforme.",
      policy4Title: "4. Validez Legal de la Factura Electrónica",
      policy4Body:
        "Factura generada electrónicamente. El QR solo verifica el registro del pedido; no certifica el cumplimiento fiscal, la cobertura de garantía ni todo el contenido de una copia.",
      sigSellerTitle: "Sello Oficial y Autorización",
      sigSellerRole: "División Legal y de Facturación — WEEXEY",
      sigStampTop: "WEEXEY COMMERCE LTD",
      sigStampCenter: "SELLO OFICIAL · VERIFIED",
      sigStampBottom: "CR: 1010894521 · IVA",
      sigBuyerTitle: "Acuse de Recibo del Cliente",
      sigBuyerNameLine: "Recibido por:",
      sigBuyerSignLine: "Firma del receptor:",
      sigBuyerDateLine: "Fecha de entrega:",
      footerLegalLine:
        "© WEEXEY Commerce & Technology Ltd. Todos los derechos reservados — Factura fiscal electrónica auditada.",
      pageIndicator: "Página 1 de 1",
    },
    zh: {
      dir: "ltr",
      lang: "zh-CN",
      docTitle: "官方税务发票 | WEEXEY",
      previewBarTitle: "官方正式税务发票预览",
      previewBarSub: "单页 A4 法定商业发票 — 支持一键直接下载 PDF 文件",
      downloadPdfBtn: "直接下载 PDF 发票 (单页)",
      downloadingBtn: "正在生成 PDF...",
      printNowBtn: "打印",
      closePreviewBtn: "关闭预览",
      companyLegalName: "WEEXEY 商业与科技有限公司 (WEEXEY Commerce & Technology Ltd.)",
      companyBranch: "区域运营与物流配送总部 — 利雅得",
      companyAddress: "King Fahd Road, 阿卜杜拉国王金融区 (KAFD), 4号商务楼, 邮编 13519",
      crLabel: "商业登记号 (CR)",
      crNumber: "1010894521",
      trnLabel: "税务登记号 (VAT / TRN)",
      trnNumber: "310489275600003",
      supportEmailLabel: "官方财务邮箱",
      supportEmail: "legal-billing@weexey.com",
      invoiceBadge: "官方认证法定税务凭证",
      invoiceMainTitle: "官方正式税务发票",
      invoiceSubtitle: "OFFICIAL TAX INVOICE & 2-YEAR WARRANTY CERTIFICATE",
      metaInvoiceNo: "税务发票编号",
      metaOrderNo: "关联订单编号",
      metaIssueDate: "签发日期与时间",
      metaPaymentMethod: "核准支付方式",
      metaPaymentVal: "货到付款 (现金 / 银行卡刷卡)",
      metaSupplyDate: "预计配送时效",
      metaSupplyVal: "签发后 1–2 个工作日内送达",
      metaCurrency: "结算币种",
      statusConfirmed: "已确认并核准发货",
      statusShipped: "运输派送中",
      statusDelivered: "已签收并结清",
      statusCancelled: "已取消 (仅供参考)",
      sellerBoxTitle: "销售方信息 (官方授权商家)",
      buyerBoxTitle: "购买方及法定收货地址 (客户)",
      customerNameLabel: "收件人 / 客户姓名",
      customerPhoneLabel: "联系电话",
      customerEmailLabel: "电子邮箱",
      customerCityLabel: "城市 / 地区",
      customerAddressLabel: "详细收货地址",
      customerNotesLabel: "配送备注说明",
      notProvided: "未提供",
      tableSectionTitle: "应税商品及硬件设备明细表",
      colIndex: "序号",
      colSku: "商品编码 (SKU)",
      colDescription: "商品名称及规格配置",
      colQty: "数量",
      colUnitExcl: "不含税单价",
      colVatRate: "税率",
      colVatAmount: "增值税额 (15%)",
      colLineTotal: "含税小计",
      serialWarrantyNote: "包含 24 个月官方区域联保服务",
      summarySectionTitle: "财务与税费汇总明细",
      sumExclVat: "不含税商品总额",
      sumDiscount: "优惠券及促销抵扣",
      sumShipping: "特快保价物流运费",
      sumFreeShipping: "免运费 (0.00)",
      sumVatTotal: "增值税总额 (15% 内含税)",
      sumGrandTotal: "应付含税总金额",
      sumCodNote: "货到付款应收净额 (COD)：",
      verificationBoxTitle: "发票记录核验",
      qrCaption: "扫描或点击二维码，核对商店记录中的发票编号、日期和订单状态，不显示客户信息。",
      qrUnavailable: "此预览或发票暂不支持在线核验。",
      authCodeLabel: "发票编号：",
      policiesHeaderTitle: "法定销售条款、2年官方保修政策、7天退换货规定及货到付款签收须知",
      policiesHeaderCode: "DOCUMENT REF: WX-LEGAL-2026-REV4",
      policy1Title: "1. 官方 2 年（24 个月）全面质量保修政策",
      policy1Body:
        "WEEXEY 对本发票所列全部电子产品提供自实际签收之日起二十四 (24) 个月的官方质量保修，涵盖正常使用下的制造缺陷与硬件故障。本税务发票即为法定官方保修凭证，申请售后时须出示发票号或订单号。人为损坏、进液、私自拆修及正常损耗不在保修范围内。",
      policy2Title: "2. 7 天法定无忧退换货政策",
      policy2Body:
        "符合条件的商品自签收之日起七 (7) 个自然日内可申请退货或换货。商品须保持全新未使用状态、原厂封条完好，且包装盒、全部配件、说明书及赠品齐全。仓库技术核验通过后将于 3–5 个工作日内完成退款。",
      policy3Title: "3. 货到付款 (COD) 验货与签收法律声明",
      policy3Body:
        "所有包裹均附有 WEEXEY 防拆安全封条。客户在向配送员付款前有权核对包裹外包装完整性及订单编号。完成付款或签署配送单即视为法律上确认收到外观完好无损之商品。",
      policy4Title: "4. 电子税务发票之法律效力",
      policy4Body:
        "本发票由系统生成。二维码仅核验商店订单记录，不单独证明税务合规、保修资格或发票副本的全部内容。",
      sigSellerTitle: "企业官方签章与核准",
      sigSellerRole: "WEEXEY 法务与税务结算中心",
      sigStampTop: "WEEXEY COMMERCE LTD",
      sigStampCenter: "官方税务专用章 · VERIFIED",
      sigStampBottom: "CR: 1010894521 · VAT",
      sigBuyerTitle: "客户签收确认栏 (交货时签署)",
      sigBuyerNameLine: "签收人姓名：",
      sigBuyerSignLine: "签收人签名：",
      sigBuyerDateLine: "实际签收日期：",
      footerLegalLine:
        "© WEEXEY Commerce & Technology Ltd. 版权所有 — 系统自动生成并备案之法定电子税务发票。",
      pageIndicator: "第 1 页 / 共 1 页",
    },
  };

  function escapeHtml(str) {
    return String(str ?? "").replace(
      /[&<>"']/g,
      (ch) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[ch],
    );
  }

  function buildVerificationQrSvg(url) {
    if (typeof window.qrcode !== "function") throw new Error("Invoice QR encoder is not loaded.");
    const qr = window.qrcode(0, "M");
    qr.addData(url, "Byte");
    qr.make();
    return qr.createSvgTag({ cellSize: 2, margin: 8, scalable: true });
  }

  function generateSku(item, idx) {
    const rawId = String(item.id || item.slug || item.name || `ITEM-${idx + 1}`)
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const prefix = rawId.slice(0, 10) || `PRD-0${idx + 1}`;
    return `WX-${prefix}`;
  }

  function formatMoneyForInvoice(amountSar, store) {
    const currency = store?.getCurrency ? store.getCurrency() : "USD";
    const converted = store?.convertCurrency
      ? store.convertCurrency(Number(amountSar) || 0, "SAR", currency)
      : Number(amountSar) || 0;
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(converted);
    } catch {
      return `${converted.toFixed(2)} ${currency}`;
    }
  }

  function normalizeInvoiceData(payload, store) {
    const profile = store?.getProfile ? store.getProfile() : {};
    const orderNumber = String(
      payload.orderNumber || payload.id || payload.order_number || "WX-2026-0001",
    ).replace(/^#/, "");
    const invoiceNumber = `INV-${orderNumber}`;
    const createdAtIso = payload.createdAt || payload.created_at || new Date().toISOString();

    let formattedIssueDate = payload.formattedDate || payload.date || "";
    try {
      const parsed = new Date(createdAtIso);
      if (!Number.isNaN(parsed.getTime())) {
        formattedIssueDate = new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(parsed);
      }
    } catch {
      if (!formattedIssueDate) formattedIssueDate = createdAtIso.slice(0, 10);
    }

    const rawItems = Array.isArray(payload.items) ? payload.items : [];
    const items = rawItems.map((item, idx) => {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const unitInclVat = Number(item.price ?? item.unitPrice) || 0;
      const lineInclVat = unitInclVat * qty;
      const unitExclVat = unitInclVat / (1 + VAT_RATE);
      const lineExclVat = lineInclVat / (1 + VAT_RATE);
      const lineVat = lineInclVat - lineExclVat;
      return {
        index: idx + 1,
        sku: generateSku(item, idx),
        brand: item.brand || "WEEXEY",
        name: item.name || "Product",
        variant: item.variant || "",
        quantity: qty,
        unitExclVat,
        unitInclVat,
        lineExclVat,
        lineVat,
        lineInclVat,
      };
    });

    const computedItemsIncl = items.reduce((sum, i) => sum + i.lineInclVat, 0);
    const subtotalIncl = Number(payload.subtotal) > 0 ? Number(payload.subtotal) : computedItemsIncl;
    const discountTotal = Math.max(0, Number(payload.discountTotal ?? payload.discount_total) || 0);
    const couponCode = String(payload.couponCode || payload.coupon_code || "").trim();

    let grandTotal = Number(payload.total) > 0 ? Number(payload.total) : Math.max(0, subtotalIncl - discountTotal);
    let shippingTotal =
      payload.shippingTotal !== undefined && payload.shippingTotal !== null
        ? Number(payload.shippingTotal)
        : payload.shipping_total !== undefined && payload.shipping_total !== null
          ? Number(payload.shipping_total)
          : Math.max(0, grandTotal - (subtotalIncl - discountTotal));

    if (!Number.isFinite(shippingTotal) || shippingTotal < 0) shippingTotal = 0;
    if (grandTotal <= 0) {
      grandTotal = Math.max(0, subtotalIncl - discountTotal + shippingTotal);
    }

    const totalExclVat = grandTotal / (1 + VAT_RATE);
    const totalVatAmount = grandTotal - totalExclVat;

    const customer = {
      name:
        payload.customerName ||
        payload.customer?.name ||
        profile?.name ||
        "Authorized WEEXEY Customer",
      phone: payload.phone || payload.customer?.phone || profile?.phone || "",
      email: payload.email || payload.customer?.email || profile?.email || "",
      city: payload.city || payload.customer?.city || profile?.city || "",
      address: payload.address || payload.customer?.address || "",
      postal: payload.postal || payload.customer?.postal || "",
      notes: payload.notes || payload.customer?.notes || "",
    };

    const status = String(payload.status || "confirmed").toLowerCase();

    return {
      orderNumber,
      invoiceNumber,
      createdAtIso,
      formattedIssueDate,
      status,
      customer,
      items,
      subtotalIncl,
      subtotalExcl: subtotalIncl / (1 + VAT_RATE),
      discountTotal,
      couponCode,
      shippingTotal,
      totalExclVat,
      totalVatAmount,
      grandTotal,
      currency: store?.getCurrency ? store.getCurrency() : "USD",
      verificationUrl: /^[0-9a-f]{64}$/.test(payload.verificationToken || "")
        ? `${verificationPageUrl.href}?lang=${invoiceLanguage(payload.invoiceLanguage || store?.getLanguage?.())}#${payload.verificationToken}`
        : "",
    };
  }

  function buildBarcodeSvg(seedString) {
    let bars = "";
    let x = 3;
    for (let i = 0; i < 40; i += 1) {
      const ch = seedString.charCodeAt(i % seedString.length) || 65;
      const w = ((ch + i * 7) % 3) === 0 ? 2.2 : ((ch + i) % 2 === 0 ? 1.3 : 0.85);
      const gap = ((ch * 3 + i) % 2 === 0) ? 1.4 : 0.95;
      bars += `<rect x="${x.toFixed(1)}" y="2" width="${w.toFixed(1)}" height="18" fill="#1e293b"/>`;
      x += w + gap;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(x + 3)} 22" width="136" height="20" aria-label="Barcode">${bars}</svg>`;
  }

  function readCustomInvoiceConfig() {
    try {
      const fromWindow = window.RUQO_STORE_SETTINGS?.invoice_config;
      if (fromWindow && typeof fromWindow === "object") return fromWindow;
      const rawCache = localStorage.getItem("ruqo-store-settings-cache-v1");
      if (rawCache) {
        const parsed = JSON.parse(rawCache);
        if (parsed?.settings?.invoice_config) return parsed.settings.invoice_config;
      }
      const rawLocal = localStorage.getItem("weexey-invoice-config-v1");
      if (rawLocal) return JSON.parse(rawLocal);
    } catch (_) {}
    return {};
  }

  const invoiceLanguages = { en: "English" };
  const sectionSelectors = {
    header: ".inv-header-banner",
    metadata: ".inv-meta-strip",
    parties: ".inv-parties-grid",
    items: ".inv-items-section",
    totals: ".inv-Totals-qr-grid",
    policies: ".inv-policies-panel",
    footer: ".inv-footer",
  };
  const visibilitySelectors = {
    logo: ".inv-logo-row img",
    watermark: ".invoice-watermark",
    status: ".inv-status-chip",
    orderNumber: ".inv-meta-strip .meta-cell:nth-child(2)",
    payment: ".inv-meta-strip .meta-cell:nth-child(4)",
    supply: ".inv-meta-strip .meta-cell:nth-child(5)",
    seller: ".party-box:not(.is-buyer)",
    phone: "[data-invoice-field='phone']",
    email: "[data-invoice-field='email']",
    address: "[data-invoice-field='address']",
    notes: "[data-invoice-field='notes']",
    brand: ".item-brand-tag",
    variant: ".item-variant",
    warranty: ".warranty-chip",
    verification: ".inv-qr-box",
    cod: ".summary-cod-banner",
    signatures: ".inv-signatures-grid",
    seal: ".inv-brand-seal",
    barcode: ".sig-barcode-wrap",
    policies: ".inv-policies-panel",
    footer: ".inv-bottom-bar",
  };
  const columnKeys = ["index", "sku", "description", "quantity", "unitPrice", "vatRate", "vatAmount", "total"];
  const requiredColumns = ["description", "quantity", "total"];

  function invoiceLanguage() {
    return "en";
  }

  function normalizeCustomConfig(value = {}) {
    const cfg = value && typeof value === "object" ? value : {};
    const appearance = cfg.appearance || {};
    const bounded = (value, min, max, fallback) =>
      Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;
    const color = (value, fallback) => /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback;
    let logoUrl = "";
    if (cfg.logoUrl) {
      try {
        const url = new URL(cfg.logoUrl, window.location.origin);
        if (url.protocol === "https:" || (url.origin === window.location.origin && url.protocol === "http:")) {
          logoUrl = url.href;
        }
      } catch {
        console.warn("Invalid invoice logo URL.");
      }
    }
    const uniqueOrder = (order, keys) => [...new Set([
      ...(Array.isArray(order) ? order.filter((key) => keys.includes(key)) : []), ...keys,
    ])];
    const visibility = Object.fromEntries(Object.keys(visibilitySelectors).map((key) => [key, cfg.visibility?.[key] !== false]));
    const columns = uniqueOrder(cfg.columns, columnKeys);
    const hiddenColumns = Array.isArray(cfg.hiddenColumns)
      ? cfg.hiddenColumns.filter((key) => columnKeys.includes(key) && !requiredColumns.includes(key))
      : [];
    return {
      ...cfg,
      logoUrl,
      visibility,
      columns,
      hiddenColumns,
      sections: uniqueOrder(cfg.sections, Object.keys(sectionSelectors)),
      appearance: {
        accent: color(appearance.accent, "#4f46e5"),
        secondary: color(appearance.secondary, "#0d9488"),
        ink: color(appearance.ink, "#0f172a"),
        font: ["Cairo", "Manrope", "Arial", "Georgia"].includes(appearance.font) ? appearance.font : "Cairo",
        fontScale: bounded(appearance.fontScale, 0.8, 1.3, 1),
        spacing: bounded(appearance.spacing, 4, 18, 9),
        padding: bounded(appearance.padding, 4, 14, 8),
        logoHeight: bounded(appearance.logoHeight, 20, 64, 30),
      },
    };
  }

  function resolveCopyWithCustomConfig(customOverride = null, language = "en") {
    const lang = invoiceLanguage(language);
    const base = {
      ...INVOICE_I18N[lang],
      watermarkText: "WEEXEY OFFICIAL",
      previewBrandText: "WEEXEY OFFICIAL",
      sellerTag: lang === "ar" ? "المقر الرئيسي" : "CORPORATE HQ",
      sellerStoreName: "WEEXEY OFFICIAL STORE",
      buyerTag: lang === "ar" ? "العميل" : "VERIFIED CLIENT",
    };
    const cfg = customOverride || readCustomInvoiceConfig();
    if (!cfg || typeof cfg !== "object") return base;

    if (cfg.trn_number) base.trnNumber = String(cfg.trn_number).trim();
    if (cfg.cr_number) base.crNumber = String(cfg.cr_number).trim();
    if (cfg.billing_email) base.supportEmail = String(cfg.billing_email).trim();
    if (lang === "en") {
      if (cfg.company_name_en) base.companyLegalName = String(cfg.company_name_en).trim();
      if (cfg.company_branch_en) base.companyBranch = String(cfg.company_branch_en).trim();
      if (cfg.company_address_en) base.companyAddress = String(cfg.company_address_en).trim();
      if (cfg.policy1_body_en) base.policy1Body = String(cfg.policy1_body_en).trim();
      if (cfg.policy2_body_en) base.policy2Body = String(cfg.policy2_body_en).trim();
      if (cfg.policy3_body_en) base.policy3Body = String(cfg.policy3_body_en).trim();
      if (cfg.policy4_body_en) base.policy4Body = String(cfg.policy4_body_en).trim();
    }
    for (const [key, text] of Object.entries(cfg.texts?.[lang] || {})) {
      if (Object.hasOwn(base, key) && !["lang", "dir", "trnNumber", "crNumber", "supportEmail"].includes(key) && typeof text === "string") {
        base[key] = text;
      }
    }
    return base;
  }

  function buildBrandSealSvg(copy) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 110" width="64" height="64" aria-label="Official Corporate Seal">
      <defs>
        <linearGradient id="wxBrandSealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4f46e5"/>
          <stop offset="50%" stop-color="#6d28d9"/>
          <stop offset="100%" stop-color="#0d9488"/>
        </linearGradient>
      </defs>
      <circle cx="55" cy="55" r="49" fill="rgba(79,70,229,0.04)" stroke="url(#wxBrandSealGrad)" stroke-width="2" stroke-dasharray="4 2"/>
      <circle cx="55" cy="55" r="43" fill="none" stroke="url(#wxBrandSealGrad)" stroke-width="1.2"/>
      <circle cx="55" cy="55" r="30" fill="rgba(13,148,136,0.04)" stroke="#cbd5e1" stroke-width="0.9"/>
      <text x="55" y="24" text-anchor="middle" fill="#4338ca" font-size="6.2" font-weight="800" font-family="Cairo, sans-serif">${escapeHtml(copy.sigStampTop)}</text>
      <text x="55" y="50" text-anchor="middle" fill="#0f172a" font-size="7.2" font-weight="900" font-family="Cairo, sans-serif">${escapeHtml(copy.sigStampCenter)}</text>
      <text x="55" y="68" text-anchor="middle" fill="#0d9488" font-size="6" font-weight="800" font-family="Cairo, sans-serif">${escapeHtml(copy.sigStampBottom)}</text>
      <text x="55" y="90" text-anchor="middle" fill="#475569" font-size="5.6" font-weight="800" font-family="ui-monospace, monospace">TRN: ${escapeHtml(copy.trnNumber)}</text>
    </svg>`;
  }

  function buildInvoiceDocumentHtml(data, copy, store, language, autoPrint = false, customConfig = {}, embedded = false) {
    const cfg = normalizeCustomConfig(customConfig);
    const fmt = (val) => formatMoneyForInvoice(val, store, language);
    const logoUrl = cfg.logoUrl || new URL("/images/new/li.png", window.location.origin).href;
    const qrSvg = data.verificationUrl ? buildVerificationQrSvg(data.verificationUrl) : "";
    const barcodeSvg = buildBarcodeSvg(`${data.invoiceNumber}-${data.orderNumber}`);
    const brandSealSvg = buildBrandSealSvg(copy);

    let statusLabel = copy.statusConfirmed;
    let statusClass = "status-confirmed";
    if (data.status === "delivered") {
      statusLabel = copy.statusDelivered;
      statusClass = "status-delivered";
    } else if (data.status === "cancelled" || data.status === "refunded") {
      statusLabel = copy.statusCancelled;
      statusClass = "status-cancelled";
    } else if (data.status === "shipped") {
      statusLabel = copy.statusShipped;
      statusClass = "status-shipped";
    }

    const itemsRowsHtml = data.items
      .map(
        (item) => `
        <tr>
          <td class="col-center"><span class="row-idx">${String(item.index).padStart(2, "0")}</span></td>
          <td class="col-sku" dir="ltr">${escapeHtml(item.sku)}</td>
          <td class="col-desc">
            <div class="item-title-line">
              <span class="item-brand-tag">${escapeHtml(item.brand)}</span>
              <strong>${escapeHtml(item.name)}</strong>
            </div>
            <div class="item-sub-meta">
              ${item.variant ? `<span class="item-variant">${escapeHtml(item.variant)}</span> · ` : ""}
              <span class="warranty-chip">✓ ${escapeHtml(copy.serialWarrantyNote)}</span>
            </div>
          </td>
          <td class="col-center"><strong>${item.quantity}</strong></td>
          <td class="col-num">${escapeHtml(fmt(item.unitExclVat))}</td>
          <td class="col-center" dir="ltr"><span class="vat-pill">15%</span></td>
          <td class="col-num">${escapeHtml(fmt(item.lineVat))}</td>
          <td class="col-num col-bold">${escapeHtml(fmt(item.lineInclVat))}</td>
        </tr>
      `,
      )
      .join("");

    const fullAddress = [
      data.customer.address,
      data.customer.city,
      data.customer.postal ? `(${data.customer.postal})` : "",
    ]
      .filter(Boolean)
      .join(" — ");

    return `<!doctype html>
<html lang="${escapeHtml(copy.lang)}" dir="${escapeHtml(copy.dir)}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(copy.docTitle)} — #${escapeHtml(data.orderNumber)}</title>
  <link rel="icon" type="image/png" href="${escapeHtml(logoUrl)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {
      --navy-deep: #0f172a;
      --navy-mid: #1e293b;
      --brand-purple: #5b21b6;
      --brand-indigo: #4f46e5;
      --brand-teal: #0d9488;
      --brand-tint: #f5f3ff;
      --teal-tint: #f0fdfa;
      --ink: #0f172a;
      --ink-soft: #334155;
      --muted: #64748b;
      --line: #e2e8f0;
      --line-strong: #cbd5e1;
      --surface-subtle: #f8fafc;
      --emerald: #059669;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #eef2f6;
      color: var(--ink);
      font-family: "Cairo", "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 11px;
      line-height: 1.4;
      overflow-x: hidden;
    }

    /* Top Interactive Preview Bar */
    .preview-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 28px;
      background: #0f172a;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: #f8fafc;
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.18);
    }

    .toolbar-info {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .toolbar-brand-badge {
      padding: 4px 10px;
      border-radius: 5px;
      background: linear-gradient(135deg, #6d28d9, #0d9488);
      color: #ffffff;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .toolbar-info strong {
      display: block;
      font-size: 13.5px;
      font-weight: 800;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toolbar-info span {
      display: block;
      font-size: 11px;
      color: #94a3b8;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .toolbar-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 8px 16px;
      border-radius: 7px;
      font-family: inherit;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.07);
      color: #f8fafc;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .toolbar-btn:hover {
      background: rgba(255, 255, 255, 0.14);
    }

    .toolbar-btn-primary {
      background: linear-gradient(135deg, #4f46e5, #0d9488);
      border-color: transparent;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
    }

    .toolbar-btn-primary:hover {
      filter: brightness(1.08);
    }

    /* Responsive Viewport Stage for Mobile & Desktop A4 Preview */
    .invoice-preview-stage {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 20px 12px 36px;
      overflow: hidden;
    }

    /* Single-Page A4 Sheet */
    .invoice-a4-sheet {
      width: 794px;
      min-width: 794px;
      max-width: 794px;
      margin: 0 auto;
      padding: 7.5mm 9.5mm 6.5mm;
      background: #ffffff;
      box-shadow: 0 16px 48px rgba(15, 23, 42, 0.12);
      transform-origin: top center;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    @media (max-width: 820px) {
      .preview-toolbar {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
        padding: 10px 14px;
      }

      .toolbar-info {
        gap: 10px;
      }

      .toolbar-info strong {
        font-size: 12.5px;
      }

      .toolbar-info span {
        font-size: 10px;
      }

      .toolbar-actions {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 6px;
      }

      .toolbar-btn {
        padding: 9px 12px;
        font-size: 11.5px;
      }

      .invoice-preview-stage {
        padding: 12px 8px 24px;
      }
    }

    /* Soft Single Frame around the Invoice */
    .invoice-single-frame {
      position: relative;
      border: 1px solid var(--line-strong);
      border-radius: 8px;
      padding: 6.5mm 7.5mm 5.5mm;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      gap: 9px;
      overflow: hidden;
    }

    /* Very Subtle Watermark */
    .invoice-watermark {
      position: absolute;
      top: 48%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-26deg);
      font-size: 54px;
      font-weight: 900;
      letter-spacing: 0.16em;
      color: rgba(15, 23, 42, 0.018);
      white-space: nowrap;
      pointer-events: none;
      user-select: none;
      z-index: 0;
    }

    .invoice-content-layer {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 9px;
    }

    /* 1. Formal white invoice header */
    .inv-header-banner {
      display: flex;
      justify-content: space-between;
      align-items: stretch;
      gap: 18px;
      padding: 13px 16px;
      background: #ffffff;
      color: var(--ink);
      border-radius: 7px;
      position: relative;
      overflow: hidden;
    }

    .inv-header-banner::after {
      content: "";
      position: absolute;
      inset: auto 0 0 0;
      height: 1px;
      background: var(--line-strong);
    }

    .inv-brand-col {
      max-width: 58%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .inv-logo-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 5px;
    }

    .inv-logo-row img {
      height: 30px;
      width: auto;
      object-fit: contain;
    }

    .inv-company-name {
      margin: 0;
      font-size: 13.5px;
      font-weight: 800;
      color: var(--ink);
      letter-spacing: 0.01em;
    }

    .inv-company-sub {
      margin: 1.5px 0;
      font-size: 9px;
      color: var(--ink-soft);
      font-weight: 500;
    }

    .inv-reg-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 7px;
    }

    .reg-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 2.5px 8px;
      border-radius: 4px;
      background: var(--surface-subtle);
      border: 1px solid var(--line);
      font-size: 8.5px;
      color: var(--ink-soft);
    }

    .reg-pill strong {
      color: var(--ink);
      font-weight: 800;
    }

    .inv-title-col {
      text-align: end;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
    }

    .inv-certified-badge {
      display: inline-block;
      padding: 2.5px 9px;
      border-radius: 4px;
      background: var(--navy-deep);
      border: 1px solid var(--navy-deep);
      color: #ffffff;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .inv-main-heading {
      margin: 4px 0 2px;
      font-size: 17.5px;
      font-weight: 900;
      color: var(--ink);
      letter-spacing: 0.01em;
      line-height: 1.15;
    }

    .inv-sub-heading {
      margin: 0 0 6px;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--muted);
      text-transform: uppercase;
    }

    .inv-status-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 2.5px 10px;
      border-radius: 999px;
      font-size: 8.8px;
      font-weight: 800;
    }

    .status-confirmed, .status-shipped, .status-delivered {
      color: #6ee7b7;
      background: rgba(16, 185, 129, 0.18);
      border: 1px solid rgba(52, 211, 153, 0.4);
    }

    .status-cancelled {
      color: #fca5a5;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(248, 113, 113, 0.4);
    }

    .inv-header-banner :is(.status-confirmed, .status-shipped, .status-delivered) {
      color: #047857;
    }

    .inv-header-banner .status-cancelled {
      color: #b91c1c;
    }

    /* 2. Spacious 3-Column (2x3) Metadata Grid - No Cramped Wrapped Numbers */
    .inv-meta-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 7px 16px;
      padding: 8px 13px;
      background: var(--surface-subtle);
      border: 1px solid var(--line);
      border-radius: 6px;
    }

    .meta-cell {
      display: flex;
      flex-direction: column;
      gap: 1.5px;
    }

    .meta-cell span {
      font-size: 8px;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .meta-cell strong {
      font-size: 9.8px;
      font-weight: 800;
      color: var(--ink);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* 3. Parties Grid (Seller & Customer) */
    .inv-parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .party-box {
      padding: 8px 12px;
      border: 1px solid var(--line);
      border-top: 2.5px solid var(--brand-indigo);
      border-radius: 6px;
      background: #ffffff;
    }

    .party-box.is-buyer {
      border-top-color: var(--brand-teal);
      background: #fafcff;
    }

    .party-box-head {
      margin: 0 0 6px;
      padding-bottom: 4px;
      border-bottom: 1px solid var(--line);
      font-size: 9px;
      font-weight: 800;
      color: var(--ink);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .party-box-head .head-tag {
      font-size: 7.5px;
      padding: 1.5px 6px;
      border-radius: 4px;
      background: var(--brand-tint);
      color: var(--brand-purple);
      font-weight: 800;
    }

    .party-box.is-buyer .party-box-head .head-tag {
      background: var(--teal-tint);
      color: var(--brand-teal);
    }

    .party-rows {
      display: grid;
      gap: 3px;
      font-size: 9.3px;
    }

    .party-row {
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }

    .party-row span {
      color: var(--muted);
      font-weight: 600;
      flex-shrink: 0;
    }

    .party-row strong {
      color: var(--ink);
      font-weight: 700;
      text-align: end;
    }

    /* 4. Itemized Schedule Table */
    .inv-section-head-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0 0 5px;
    }

    .inv-section-caption {
      margin: 0;
      font-size: 9.3px;
      font-weight: 800;
      color: var(--ink);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .inv-section-caption::before {
      content: "";
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 2px;
      background: linear-gradient(135deg, var(--brand-indigo), var(--brand-teal));
    }

    .inv-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.4px;
      border: 1px solid var(--line-strong);
      border-radius: 6px;
      overflow: hidden;
    }

    .inv-table th {
      background: var(--navy-deep);
      color: #ffffff;
      font-weight: 700;
      padding: 6px 8px;
      border: 1px solid var(--navy-mid);
      text-align: start;
      font-size: 8.6px;
      letter-spacing: 0.02em;
    }

    .inv-table td {
      padding: 6.5px 8px;
      border: 1px solid var(--line);
      vertical-align: middle;
    }

    .inv-table tbody tr:nth-child(even) {
      background: var(--surface-subtle);
    }

    .row-idx {
      display: inline-block;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 8.5px;
      font-weight: 700;
      color: var(--muted);
    }

    .inv-table .col-center {
      text-align: center;
    }

    .inv-table .col-num {
      text-align: end;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }

    .inv-table .col-sku {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 8.8px;
      font-weight: 600;
      color: var(--ink-soft);
      white-space: nowrap;
    }

    .inv-table .col-bold {
      font-weight: 800;
      color: var(--ink);
    }

    .item-title-line {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .item-brand-tag {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 4px;
      background: var(--brand-tint);
      color: var(--brand-purple);
      border: 1px solid #ddd6fe;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 0.02em;
    }

    .item-sub-meta {
      margin-top: 2px;
      font-size: 8.4px;
      color: var(--muted);
    }

    .warranty-chip {
      color: var(--brand-teal);
      font-weight: 700;
    }

    .vat-pill {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 4px;
      background: #f1f5f9;
      font-size: 8.2px;
      font-weight: 700;
      color: var(--ink-soft);
    }

    /* 5. Summary + QR Verification Split */
    .inv-Totals-qr-grid {
      display: grid;
      grid-template-columns: 1.06fr 0.94fr;
      gap: 10px;
      align-items: stretch;
    }

    .inv-qr-box {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 8px 11px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--surface-subtle);
    }

    .inv-qr-svg {
      padding: 3px;
      background: #ffffff;
      border: 1px solid var(--line-strong);
      border-radius: 5px;
      flex-shrink: 0;
    }

    .inv-qr-svg svg {
      width: 66px;
      height: 66px;
      display: block;
    }

    .inv-qr-placeholder {
      display: grid;
      place-items: center;
      width: 66px;
      height: 66px;
      color: var(--muted);
    }

    .inv-qr-copy {
      flex: 1;
      min-width: 0;
    }

    .inv-qr-copy h4 {
      margin: 0 0 2px;
      font-size: 9.4px;
      font-weight: 800;
      color: var(--ink);
    }

    .inv-qr-copy p {
      margin: 0 0 5px;
      font-size: 8.3px;
      color: var(--ink-soft);
      line-height: 1.32;
    }

    .inv-hash-code {
      display: inline-block;
      padding: 2px 7px;
      background: var(--brand-tint);
      color: var(--brand-purple);
      border: 1px solid #ddd6fe;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 0.03em;
    }

    .inv-summary-box {
      border: 1px solid var(--line-strong);
      border-radius: 6px;
      overflow: hidden;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4.5px 10px;
      border-bottom: 1px solid var(--line);
      font-size: 9.2px;
    }

    .summary-row span {
      color: var(--ink-soft);
      font-weight: 600;
    }

    .summary-row strong {
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--ink);
    }

    .summary-row.is-discount strong {
      color: var(--emerald);
    }

    .summary-row.is-grand {
      background: linear-gradient(125deg, #0f172a 0%, #1e1b4b 100%);
      color: #ffffff;
      padding: 6.5px 10px;
      border-bottom: none;
    }

    .summary-row.is-grand span {
      color: #f8fafc;
      font-weight: 800;
      font-size: 9.8px;
    }

    .summary-row.is-grand strong {
      color: #5eead4;
      font-size: 12.5px;
      font-weight: 900;
    }

    .summary-cod-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4.5px 10px;
      background: var(--teal-tint);
      color: #0f766e;
      border-top: 1px solid #99f6e4;
      font-size: 8.8px;
      font-weight: 800;
    }

    /* 6. Legal Policies & Terms Block */
    .inv-policies-panel {
      border: 1px solid var(--line);
      border-top: 2px solid var(--navy-deep);
      border-radius: 6px;
      padding: 7px 11px;
      background: #fcfcfd;
    }

    .policies-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 4px;
      margin-bottom: 5px;
      border-bottom: 1px solid var(--line);
    }

    .policies-head h3 {
      margin: 0;
      font-size: 8.9px;
      font-weight: 800;
      color: var(--ink);
      letter-spacing: 0.02em;
    }

    .policies-head span {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 7.8px;
      font-weight: 700;
      color: var(--brand-indigo);
    }

    .policies-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px 12px;
    }

    .policy-clause h4 {
      margin: 0 0 1.5px;
      font-size: 8.3px;
      font-weight: 800;
      color: var(--ink);
    }

    .policy-clause p {
      margin: 0;
      font-size: 7.6px;
      color: var(--ink-soft);
      line-height: 1.28;
      text-align: justify;
    }

    /* 7. Official Signatures, Circular Brand Seal & POD Footer */
    .inv-signatures-grid {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 10px;
      align-items: stretch;
    }

    .sig-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 6px 11px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--surface-subtle);
    }

    .sig-copy strong {
      display: block;
      font-size: 9.2px;
      font-weight: 800;
      color: var(--ink);
    }

    .sig-copy small {
      display: block;
      font-size: 8px;
      color: var(--muted);
      margin-top: 1px;
    }

    .sig-barcode-wrap {
      margin-top: 4px;
    }

    .pod-lines {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px 10px;
      width: 100%;
      font-size: 8.4px;
      color: var(--ink-soft);
    }

    .pod-line {
      border-bottom: 1px dotted var(--line-strong);
      padding-bottom: 2px;
    }

    .inv-bottom-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 4px;
      border-top: 1px solid var(--line);
      font-size: 7.9px;
      font-weight: 600;
      color: var(--muted);
    }

    @page {
      size: A4 portrait;
      margin: 0mm;
    }

    @media print {
      html, body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
        height: 297mm !important;
        max-height: 297mm !important;
        overflow: hidden !important;
      }
      .preview-toolbar {
        display: none !important;
      }
      .invoice-preview-stage {
        padding: 0 !important;
        height: auto !important;
      }
      .invoice-a4-sheet {
        width: 210mm !important;
        min-width: 210mm !important;
        max-width: 210mm !important;
        margin: 0 auto !important;
        padding: 6mm 8mm !important;
        transform: none !important;
        box-shadow: none !important;
        page-break-after: avoid !important;
        page-break-inside: avoid !important;
        break-after: avoid !important;
        break-inside: avoid !important;
      }
    }
  </style>
  <style>
    :root {
      --brand-purple: ${cfg.appearance.accent};
      --brand-indigo: ${cfg.appearance.accent};
      --brand-teal: ${cfg.appearance.secondary};
      --ink: ${cfg.appearance.ink};
    }
    .invoice-a4-sheet { padding: ${cfg.appearance.padding}mm; }
    .invoice-content-layer { gap: ${cfg.appearance.spacing}px; font-family: "${cfg.appearance.font}", "Cairo", sans-serif; }
    .invoice-content-layer :is(p, strong, span, h1, h2, h3, h4) { overflow-wrap: anywhere; }
    .meta-cell strong { white-space: normal; overflow: visible; text-overflow: clip; }
    .inv-logo-row img { height: ${cfg.appearance.logoHeight}px; max-width: 120px; object-fit: contain; }
    .inv-table th { background: ${cfg.appearance.accent}; }
    .invoice-fit-warning { padding: 10px; color: #92400e; background: #fffbeb; text-align: center; }
    [hidden] { display: none !important; }
    ${embedded ? ".preview-toolbar { display: none; }" : ""}
    @media print {
      .invoice-fit-warning { display: none !important; }
      .invoice-a4-sheet { padding: ${cfg.appearance.padding}mm !important; }
    }
  </style>
  ${embedded ? "" : '<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" defer></script>'}
</head>
<body>
  <header class="preview-toolbar">
    <div class="toolbar-info">
      <span class="toolbar-brand-badge">${escapeHtml(copy.previewBrandText)}</span>
      <div>
        <strong>${escapeHtml(copy.previewBarTitle)} — #${escapeHtml(data.orderNumber)}</strong>
        <span>${escapeHtml(copy.previewBarSub)}</span>
      </div>
    </div>
    <div class="toolbar-actions">
      <button type="button" class="toolbar-btn toolbar-btn-primary" id="wx-download-pdf-btn" onclick="downloadSinglePagePdf()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        <span id="wx-download-pdf-label">${escapeHtml(copy.downloadPdfBtn)}</span>
      </button>
      <button type="button" class="toolbar-btn" onclick="window.print()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>${escapeHtml(copy.printNowBtn)}</span>
      </button>
      <button type="button" class="toolbar-btn" onclick="closeInvoicePreview()">
        <span>${escapeHtml(copy.closePreviewBtn)}</span>
      </button>
    </div>
  </header>
  <p class="invoice-fit-warning" id="wx-fit-warning" role="status" hidden>${language === "ar" ? "تم تصغير المحتوى ليلائم A4. قلل النصوص أو حجم الخط لتحسين القراءة." : "Content was scaled to fit A4. Reduce text or font size for better readability."}</p>

  <div class="invoice-preview-stage" id="wx-invoice-stage">
    <main class="invoice-a4-sheet" id="wx-invoice-sheet">
    <div class="invoice-single-frame">
      <div class="invoice-watermark" aria-hidden="true">${escapeHtml(copy.watermarkText)}</div>

      <div class="invoice-content-layer">
        <!-- 1. WEEXEY Brand Header Banner -->
        <section class="inv-header-banner">
          <div class="inv-brand-col">
            <div class="inv-logo-row">
              <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(copy.companyLegalName)}" />
              <div>
                <h2 class="inv-company-name">${escapeHtml(copy.companyLegalName)}</h2>
                <p class="inv-company-sub">${escapeHtml(copy.companyBranch)}</p>
              </div>
            </div>
            <div class="inv-company-sub">${escapeHtml(copy.companyAddress)}</div>
            <div class="inv-reg-pills">
              <span class="reg-pill">${escapeHtml(copy.trnLabel)}: <strong dir="ltr">${escapeHtml(copy.trnNumber)}</strong></span>
              <span class="reg-pill">${escapeHtml(copy.crLabel)}: <strong dir="ltr">${escapeHtml(copy.crNumber)}</strong></span>
              <span class="reg-pill">${escapeHtml(copy.supportEmailLabel)}: <strong dir="ltr">${escapeHtml(copy.supportEmail)}</strong></span>
            </div>
          </div>

          <div class="inv-title-col">
            <span class="inv-certified-badge">${escapeHtml(copy.invoiceBadge)}</span>
            <div>
              <h1 class="inv-main-heading">${escapeHtml(copy.invoiceMainTitle)}</h1>
              <p class="inv-sub-heading">${escapeHtml(copy.invoiceSubtitle)}</p>
            </div>
            <span class="inv-status-chip ${statusClass}">● ${escapeHtml(statusLabel)}</span>
          </div>
        </section>

        <!-- 2. Spacious 3-Column (2x3) Invoice Metadata Grid -->
        <section class="inv-meta-strip">
          <div class="meta-cell">
            <span>${escapeHtml(copy.metaInvoiceNo)}</span>
            <strong dir="ltr">${escapeHtml(data.invoiceNumber)}</strong>
          </div>
          <div class="meta-cell">
            <span>${escapeHtml(copy.metaOrderNo)}</span>
            <strong dir="ltr">#${escapeHtml(data.orderNumber)}</strong>
          </div>
          <div class="meta-cell">
            <span>${escapeHtml(copy.metaIssueDate)}</span>
            <strong>${escapeHtml(data.formattedIssueDate)}</strong>
          </div>
          <div class="meta-cell">
            <span>${escapeHtml(copy.metaPaymentMethod)}</span>
            <strong>${escapeHtml(copy.metaPaymentVal)}</strong>
          </div>
          <div class="meta-cell">
            <span>${escapeHtml(copy.metaSupplyDate)}</span>
            <strong>${escapeHtml(copy.metaSupplyVal)}</strong>
          </div>
          <div class="meta-cell">
            <span>${escapeHtml(copy.metaCurrency)}</span>
            <strong dir="ltr">${escapeHtml(data.currency)} (15% VAT)</strong>
          </div>
        </section>

        <!-- 3. Contracting Parties (Seller & Customer) -->
        <section class="inv-parties-grid">
          <div class="party-box">
            <h3 class="party-box-head">
              <span>${escapeHtml(copy.sellerBoxTitle)}</span>
              <span class="head-tag">${escapeHtml(copy.sellerTag)}</span>
            </h3>
            <div class="party-rows">
              <div class="party-row">
                <span>${escapeHtml(copy.companyLegalName)}</span>
                <strong>${escapeHtml(copy.sellerStoreName)}</strong>
              </div>
              <div class="party-row">
                <span>${escapeHtml(copy.trnLabel)}</span>
                <strong dir="ltr">${escapeHtml(copy.trnNumber)}</strong>
              </div>
              <div class="party-row">
                <span>${escapeHtml(copy.crLabel)}</span>
                <strong dir="ltr">${escapeHtml(copy.crNumber)}</strong>
              </div>
              <div class="party-row">
                <span>${escapeHtml(copy.supportEmailLabel)}</span>
                <strong dir="ltr">${escapeHtml(copy.supportEmail)}</strong>
              </div>
            </div>
          </div>

          <div class="party-box is-buyer">
            <h3 class="party-box-head">
              <span>${escapeHtml(copy.buyerBoxTitle)}</span>
              <span class="head-tag">${escapeHtml(copy.buyerTag)}</span>
            </h3>
            <div class="party-rows">
              <div class="party-row">
                <span>${escapeHtml(copy.customerNameLabel)}</span>
                <strong>${escapeHtml(data.customer.name)}</strong>
              </div>
              <div class="party-row" data-invoice-field="phone">
                <span>${escapeHtml(copy.customerPhoneLabel)}</span>
                <strong dir="ltr">${escapeHtml(data.customer.phone || copy.notProvided)}</strong>
              </div>
              ${
                data.customer.email
                  ? `<div class="party-row" data-invoice-field="email"><span>${escapeHtml(copy.customerEmailLabel)}</span><strong dir="ltr">${escapeHtml(data.customer.email)}</strong></div>`
                  : ""
              }
              <div class="party-row" data-invoice-field="address">
                <span>${escapeHtml(copy.customerAddressLabel)}</span>
                <strong>${escapeHtml(fullAddress || copy.notProvided)}</strong>
              </div>
              ${
                data.customer.notes
                  ? `<div class="party-row" data-invoice-field="notes"><span>${escapeHtml(copy.customerNotesLabel)}</span><strong>${escapeHtml(data.customer.notes)}</strong></div>`
                  : ""
              }
            </div>
          </div>
        </section>

        <!-- 4. Itemized Tax Schedule Table -->
        <section class="inv-items-section">
          <div class="inv-section-head-row">
            <h3 class="inv-section-caption">${escapeHtml(copy.tableSectionTitle)}</h3>
          </div>
          <table class="inv-table">
            <thead>
              <tr>
                <th class="col-center" style="width: 30px;">${escapeHtml(copy.colIndex)}</th>
                <th style="width: 96px;">${escapeHtml(copy.colSku)}</th>
                <th>${escapeHtml(copy.colDescription)}</th>
                <th class="col-center" style="width: 44px;">${escapeHtml(copy.colQty)}</th>
                <th class="col-num" style="width: 96px;">${escapeHtml(copy.colUnitExcl)}</th>
                <th class="col-center" style="width: 54px;">${escapeHtml(copy.colVatRate)}</th>
                <th class="col-num" style="width: 92px;">${escapeHtml(copy.colVatAmount)}</th>
                <th class="col-num" style="width: 106px;">${escapeHtml(copy.colLineTotal)}</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>
        </section>

        <!-- 5. Financial Breakdown & QR Verification -->
        <section class="inv-Totals-qr-grid">
          <div class="inv-qr-box">
            <div class="inv-qr-svg">${qrSvg
              ? `<a href="${escapeHtml(data.verificationUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(copy.verificationBoxTitle)}">${qrSvg}</a>`
              : '<span class="inv-qr-placeholder" aria-hidden="true">&mdash;</span>'}</div>
            <div class="inv-qr-copy">
              <h4>${escapeHtml(copy.verificationBoxTitle)}</h4>
              <p>${escapeHtml(qrSvg ? copy.qrCaption : copy.qrUnavailable)}</p>
              <div>
                <small style="display:block;font-size:7.8px;color:#64748b;margin-bottom:2px;">${escapeHtml(copy.authCodeLabel)}</small>
                <span class="inv-hash-code" dir="ltr">${escapeHtml(data.invoiceNumber)}</span>
              </div>
            </div>
          </div>

          <div class="inv-summary-box">
            <div>
              <div class="summary-row">
                <span>${escapeHtml(copy.sumExclVat)}</span>
                <strong>${escapeHtml(fmt(data.totalExclVat))}</strong>
              </div>
              ${
                data.discountTotal > 0
                  ? `<div class="summary-row is-discount">
                      <span>${escapeHtml(copy.sumDiscount)}${data.couponCode ? ` (${escapeHtml(data.couponCode)})` : ""}</span>
                      <strong>−${escapeHtml(fmt(data.discountTotal))}</strong>
                    </div>`
                  : ""
              }
              <div class="summary-row">
                <span>${escapeHtml(copy.sumShipping)}</span>
                <strong>${data.shippingTotal > 0 ? escapeHtml(fmt(data.shippingTotal)) : escapeHtml(copy.sumFreeShipping)}</strong>
              </div>
              <div class="summary-row">
                <span>${escapeHtml(copy.sumVatTotal)}</span>
                <strong>${escapeHtml(fmt(data.totalVatAmount))}</strong>
              </div>
            </div>
            <div>
              <div class="summary-row is-grand">
                <span>${escapeHtml(copy.sumGrandTotal)}</span>
                <strong>${escapeHtml(fmt(data.grandTotal))}</strong>
              </div>
              <div class="summary-cod-banner">
                <span>${escapeHtml(copy.sumCodNote)}</span>
                <strong>${escapeHtml(fmt(data.grandTotal))}</strong>
              </div>
            </div>
          </div>
        </section>

        <!-- 6. Comprehensive Legal Policies & Statutory Terms -->
        <section class="inv-policies-panel">
          <div class="policies-head">
            <h3>${escapeHtml(copy.policiesHeaderTitle)}</h3>
            <span dir="ltr">${escapeHtml(copy.policiesHeaderCode)}</span>
          </div>
          <div class="policies-grid">
            <div class="policy-clause">
              <h4>${escapeHtml(copy.policy1Title)}</h4>
              <p>${escapeHtml(copy.policy1Body)}</p>
            </div>
            <div class="policy-clause">
              <h4>${escapeHtml(copy.policy2Title)}</h4>
              <p>${escapeHtml(copy.policy2Body)}</p>
            </div>
            <div class="policy-clause">
              <h4>${escapeHtml(copy.policy3Title)}</h4>
              <p>${escapeHtml(copy.policy3Body)}</p>
            </div>
            <div class="policy-clause">
              <h4>${escapeHtml(copy.policy4Title)}</h4>
              <p>${escapeHtml(copy.policy4Body)}</p>
            </div>
          </div>
        </section>

        <!-- 7. Signatures, Circular Brand Seal & POD Footer -->
        <footer class="inv-footer">
          <div class="inv-signatures-grid">
            <div class="sig-box">
              <div class="sig-copy">
                <strong>${escapeHtml(copy.sigSellerTitle)}</strong>
                <small>${escapeHtml(copy.sigSellerRole)}</small>
                <div class="sig-barcode-wrap" dir="ltr">${barcodeSvg}</div>
              </div>
              <div dir="ltr" class="inv-brand-seal">${brandSealSvg}</div>
            </div>

            <div class="sig-box">
              <div class="pod-lines">
                <div style="grid-column: 1 / -1; font-weight: 800; color: var(--ink); margin-bottom: 1px;">
                  ${escapeHtml(copy.sigBuyerTitle)}
                </div>
                <div class="pod-line">${escapeHtml(copy.sigBuyerNameLine)} <strong>${escapeHtml(data.customer.name)}</strong></div>
                <div class="pod-line">${escapeHtml(copy.sigBuyerSignLine)} ............................</div>
                <div class="pod-line" style="grid-column: 1 / -1;">${escapeHtml(copy.sigBuyerDateLine)} ........ / ........ / ........</div>
              </div>
            </div>
          </div>

          <div class="inv-bottom-bar">
            <span>${escapeHtml(copy.footerLegalLine)}</span>
            <span>${escapeHtml(copy.pageIndicator)}</span>
          </div>
        </footer>
      </div>
    </div>
  </main>
  </div>
  <script>
    var invoiceConfig = ${JSON.stringify(cfg).replace(/</g, "\\u003c")};
    var visibilitySelectors = ${JSON.stringify(visibilitySelectors)};
    var sectionSelectors = ${JSON.stringify(sectionSelectors)};
    var columnKeys = ${JSON.stringify(columnKeys)};
    Object.keys(visibilitySelectors).forEach(function (key) {
      if (invoiceConfig.visibility[key] === false) {
        document.querySelectorAll(visibilitySelectors[key]).forEach(function (node) { node.hidden = true; });
      }
    });
    var layer = document.querySelector(".invoice-content-layer");
    invoiceConfig.sections.forEach(function (key) {
      var section = layer.querySelector(sectionSelectors[key]);
      if (section) layer.appendChild(section);
    });
    document.querySelectorAll(".inv-table tr").forEach(function (row) {
      var cells = Array.from(row.children);
      invoiceConfig.columns.forEach(function (key) {
        var cell = cells[columnKeys.indexOf(key)];
        cell.hidden = invoiceConfig.hiddenColumns.includes(key);
        row.appendChild(cell);
      });
    });
    if (!invoiceConfig.visibility.seller) document.querySelector(".inv-parties-grid").style.gridTemplateColumns = "1fr";
    if (!invoiceConfig.visibility.verification) document.querySelector(".inv-Totals-qr-grid").style.gridTemplateColumns = "1fr";
    var fontSizes = Array.from(layer.querySelectorAll("*")).map(function (node) {
      return [node, parseFloat(getComputedStyle(node).fontSize)];
    });
    fontSizes.forEach(function (entry) {
      entry[0].style.fontSize = (entry[1] * invoiceConfig.appearance.fontScale) + "px";
    });
    function fitContentToA4() {
      var frame = document.querySelector(".invoice-single-frame");
      var sheet = document.getElementById("wx-invoice-sheet");
      frame.style.transform = "none";
      sheet.style.height = "auto";
      var padding = parseFloat(getComputedStyle(sheet).paddingTop) + parseFloat(getComputedStyle(sheet).paddingBottom);
      var available = 1120 - padding;
      var natural = frame.scrollHeight + 2;
      var scale = Math.min(1, available / natural);
      frame.style.transformOrigin = ${JSON.stringify(copy.dir === "rtl" ? "top right" : "top left")};
      frame.style.transform = "scale(" + scale + ")";
      sheet.style.height = (Math.ceil(natural * scale) + padding) + "px";
      document.getElementById("wx-fit-warning").hidden = scale >= 0.75;
    }
    function fitInvoiceSheetToMobileViewport() {
      fitContentToA4();
      var stage = document.getElementById("wx-invoice-stage");
      var sheet = document.getElementById("wx-invoice-sheet");
      if (!stage || !sheet) return;
      var baseWidth = 794;
      var availableWidth = Math.max(280, (window.innerWidth || document.documentElement.clientWidth || baseWidth) - 16);
      if (availableWidth < baseWidth) {
        var scale = availableWidth / baseWidth;
        sheet.style.transform = "scale(" + scale.toFixed(4) + ")";
        var naturalHeight = sheet.offsetHeight || 1080;
        stage.style.height = Math.ceil(naturalHeight * scale + 28) + "px";
      } else {
        sheet.style.transform = "none";
        stage.style.height = "auto";
      }
    }

    window.addEventListener("load", fitInvoiceSheetToMobileViewport);
    window.addEventListener("resize", fitInvoiceSheetToMobileViewport);
    if (document.fonts) document.fonts.ready.then(fitInvoiceSheetToMobileViewport);
    fitInvoiceSheetToMobileViewport();

    async function downloadSinglePagePdf() {
      var btn = document.getElementById("wx-download-pdf-btn");
      var label = document.getElementById("wx-download-pdf-label");
      var stage = document.getElementById("wx-invoice-stage");
      var sheet = document.getElementById("wx-invoice-sheet");
      if (!sheet) return;
      if (typeof window.html2pdf !== "function") {
        window.print();
        return;
      }
      var originalText = label ? label.textContent : "";
      var prevTransform = sheet.style.transform;
      var prevStageHeight = stage ? stage.style.height : "";
      if (btn) btn.disabled = true;
      if (label) label.textContent = ${JSON.stringify(copy.downloadingBtn).replace(/</g, "\\u003c")};
      try {
        if (document.fonts) await document.fonts.ready;
        fitContentToA4();
        sheet.style.transform = "none";
        if (stage) stage.style.height = "auto";
        var opt = {
          margin: [0, 0, 0, 0],
          filename: ${JSON.stringify(`${data.invoiceNumber}.pdf`).replace(/</g, "\\u003c")},
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            width: 794,
            height: Math.ceil(sheet.offsetHeight),
            windowWidth: 1024,
            x: 0,
            y: 0,
            useCORS: true,
            letterRendering: true,
            scrollX: 0,
            scrollY: 0,
            backgroundColor: "#ffffff",
            onclone: function (clonedDocument) {
              // html2pdf centers its container again when the capture viewport changes.
              var container = clonedDocument.querySelector(".html2pdf__container");
              var exportSheet = container && container.querySelector("#wx-invoice-sheet");
              if (!exportSheet) throw new Error("Invoice PDF export sheet is missing");
              container.style.left = "0";
              container.style.right = "auto";
              container.style.top = "0";
              container.style.margin = "0";
              container.style.width = "794px";
              exportSheet.style.margin = "0";
              exportSheet.style.transform = "none";
              exportSheet.style.boxShadow = "none";
            }
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
          },
          pagebreak: { mode: [] }
        };
        await window.html2pdf().set(opt).from(sheet).save();
      } catch (e) {
        console.error("Invoice PDF export failed", e);
        window.print();
      } finally {
        sheet.style.transform = prevTransform;
        if (stage) stage.style.height = prevStageHeight;
        fitInvoiceSheetToMobileViewport();
        if (btn) btn.disabled = false;
        if (label) label.textContent = originalText;
      }
    }
  </script>
</body>
</html>`;
  }

  function openOfficialInvoice(payload, options = {}) {
    payload = { ...payload };
    const activeLanguage = "en";
    const renderPreview = (target, language, close) => {
      target.document.open();
      target.document.write(createDocumentHtml(payload, { ...options, language: "en" }));
      target.document.close();
      target.changeInvoiceLanguage = () => renderPreview(target, "en", close);
      target.closeInvoicePreview = close;
    };
    const refreshVerification = async (target, close, isClosed) => {
      const client = options.verificationClient || window.RUQO_SUPABASE;
      if (payload.verificationToken || !client) return;
      try {
        const { data: sessionData, error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;
        if (!sessionData.session) return;
        const { data: token, error } = await client.rpc("get_invoice_verification_token", {
          p_order_number: String(payload.orderNumber || payload.order_number || payload.id || "").replace(/^#/, ""),
        });
        if (error) throw error;
        if (!token) return;
        if (!/^[0-9a-f]{64}$/.test(token)) throw new Error("Invalid invoice verification response.");
        payload.verificationToken = token;
        if (!isClosed()) renderPreview(target, activeLanguage, close);
      } catch (error) {
        console.error("Invoice verification is unavailable:", error.message);
      }
    };
    const popup = window.open("", "_blank");
    if (popup && popup.document) {
      renderPreview(popup, activeLanguage, () => popup.close());
      void refreshVerification(popup, () => popup.close(), () => popup.closed);
      return;
    }

    // Keep download controls accessible when popups are blocked.
    let printFrame = document.getElementById("wx-official-invoice-frame");
    if (printFrame) printFrame.remove();
    printFrame = document.createElement("iframe");
    printFrame.id = "wx-official-invoice-frame";
    printFrame.title = "Invoice preview";
    printFrame.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0;z-index:10000;background:white;";
    document.body.appendChild(printFrame);
    renderPreview(printFrame.contentWindow, activeLanguage, () => printFrame.remove());
    void refreshVerification(printFrame.contentWindow, () => printFrame.remove(), () => !printFrame.isConnected);
  }

  function createDocumentHtml(payload = {}, options = {}) {
    const store = window.NoursStore || window.RUQO_STORE;
    const language = "en";
    const cfg = normalizeCustomConfig(options.customConfig ?? readCustomInvoiceConfig());
    const copy = resolveCopyWithCustomConfig(cfg, language);
    const localizedPayload = {
      ...payload,
      invoiceLanguage: language,
      items: (payload.items || []).map((item) => ({
        ...item,
        name: item.nameTranslations?.en || item.name,
        variant: item.variantTranslations?.en || item.variant,
      })),
    };
    const data = normalizeInvoiceData(localizedPayload, store);
    const issuedAt = new Date(data.createdAtIso);
    if (!Number.isNaN(issuedAt.getTime())) {
      data.formattedIssueDate = new Intl.DateTimeFormat(
        "en-US",
        { dateStyle: "medium", timeStyle: "short" },
      ).format(issuedAt);
    }
    return buildInvoiceDocumentHtml(data, copy, store, language, Boolean(options.autoPrint), cfg, Boolean(options.embedded));
  }

  window.WEEXEY_INVOICE = {
    openOfficialInvoice,
    createDocumentHtml,
    normalizeCustomConfig,
    resolveCopyWithCustomConfig,
    languages: invoiceLanguages,
    sectionKeys: Object.keys(sectionSelectors),
    visibilityKeys: Object.keys(visibilitySelectors),
    columnKeys,
    requiredColumns,
    getDefaultInvoiceCopy: (language = "en") => ({ ...INVOICE_I18N[invoiceLanguage(language)] }),
  };
})();
