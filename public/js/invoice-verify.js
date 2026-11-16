(() => {
  const copy = {
    ar: {
      language: "اللغة", title: "التحقق من سجل الفاتورة", loading: "جارٍ التحقق من سجل المتجر...",
      found: "تم العثور على سجل الفاتورة في المتجر. طابق الرقم والتاريخ مع فاتورتك.",
      cancelled: "يوجد سجل لهذه الفاتورة، لكن الطلب ملغى أو مسترد.",
      missing: "لم يتم العثور على سجل بهذا الرابط، أو تم إلغاء رابط التحقق.",
      invalid: "رابط التحقق غير صالح. امسح الرمز الموجود على الفاتورة مجدداً.",
      error: "تعذر الاتصال بخدمة التحقق. لا يمكن تأكيد السجل الآن؛ حاول مرة أخرى.",
      number: "رقم الفاتورة", date: "تاريخ الإصدار", orderStatus: "حالة الطلب", retry: "إعادة المحاولة",
      privacy: "لا تعرض هذه الصفحة اسم العميل أو معلومات الاتصال أو العنوان أو المبالغ. الرابط لا يمنح حق الوصول إلى تفاصيل الطلب.",
      scope: "التحقق يؤكد وجود السجل في المتجر فقط، ولا يثبت صحة كل محتويات نسخة الفاتورة أو الامتثال الضريبي أو استحقاق الضمان.",
      orders: "طلباتي", support: "الدعم",
      statuses: ["بانتظار التأكيد", "مؤكد", "قيد التجهيز", "تم الشحن", "تم التسليم", "ملغى", "مسترد"],
    },
    en: {
      language: "Language", title: "Invoice record verification", loading: "Checking the store record...",
      found: "An invoice record was found in the store. Compare its number and date with your invoice.",
      cancelled: "A record exists, but this order is cancelled or refunded.",
      missing: "No record was found for this link, or the verification link was revoked.",
      invalid: "Invalid verification link. Scan the code on your invoice again.",
      error: "The verification service could not be reached. The record cannot be confirmed now; please retry.",
      number: "Invoice number", date: "Issue date", orderStatus: "Order status", retry: "Retry",
      privacy: "This page does not reveal customer names, contact details, addresses or amounts. The link does not grant access to order details.",
      scope: "Verification confirms the store record only, not every detail of an invoice copy, tax compliance or warranty eligibility.",
      orders: "My orders", support: "Support",
      statuses: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"],
    },
    fr: {
      language: "Langue", title: "Vérification du registre de facture", loading: "Vérification du registre...",
      found: "Un registre de facture a été trouvé. Comparez le numéro et la date avec votre facture.",
      cancelled: "Un registre existe, mais cette commande est annulée ou remboursée.",
      missing: "Aucun registre trouvé, ou le lien de vérification a été révoqué.",
      invalid: "Lien invalide. Scannez à nouveau le code de votre facture.",
      error: "Service de vérification inaccessible. Impossible de confirmer le registre ; réessayez.",
      number: "Numéro de facture", date: "Date d’émission", orderStatus: "Statut", retry: "Réessayer",
      privacy: "Aucun nom, contact, adresse ou montant du client n’est affiché. Ce lien ne donne pas accès aux détails de commande.",
      scope: "La vérification confirme uniquement le registre, pas tout le contenu d’une copie, la conformité fiscale ou le droit à la garantie.",
      orders: "Mes commandes", support: "Assistance",
      statuses: ["En attente", "Confirmée", "En préparation", "Expédiée", "Livrée", "Annulée", "Remboursée"],
    },
    es: {
      language: "Idioma", title: "Verificación del registro de factura", loading: "Consultando el registro...",
      found: "Se encontró un registro de factura. Compare su número y fecha con su factura.",
      cancelled: "Existe un registro, pero el pedido está cancelado o reembolsado.",
      missing: "No se encontró un registro, o el enlace fue revocado.",
      invalid: "Enlace inválido. Escanee de nuevo el código de su factura.",
      error: "No se pudo contactar al servicio. No es posible confirmar el registro ahora; reintente.",
      number: "Número de factura", date: "Fecha de emisión", orderStatus: "Estado", retry: "Reintentar",
      privacy: "No se muestran nombres, contactos, direcciones ni importes del cliente. El enlace no permite acceder a detalles del pedido.",
      scope: "Solo se confirma el registro, no todo el contenido de una copia, el cumplimiento fiscal o la cobertura de garantía.",
      orders: "Mis pedidos", support: "Soporte",
      statuses: ["Pendiente", "Confirmado", "En preparación", "Enviado", "Entregado", "Cancelado", "Reembolsado"],
    },
    zh: {
      language: "语言", title: "发票记录核验", loading: "正在查询商店记录...",
      found: "已找到发票记录。请核对发票编号和日期。",
      cancelled: "记录存在，但订单已取消或退款。",
      missing: "未找到记录，或核验链接已撤销。",
      invalid: "核验链接无效，请重新扫描发票二维码。",
      error: "无法连接核验服务，暂时不能确认记录，请重试。",
      number: "发票编号", date: "开具日期", orderStatus: "订单状态", retry: "重试",
      privacy: "本页不显示客户姓名、联系方式、地址或金额。此链接不授予订单详情访问权限。",
      scope: "仅确认商店记录，不证明发票副本的全部内容、税务合规或保修资格。",
      orders: "我的订单", support: "支持",
      statuses: ["待确认", "已确认", "处理中", "已发货", "已送达", "已取消", "已退款"],
    },
  };
  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
  const locale = { ar: "ar-SA", en: "en-US", fr: "fr-FR", es: "es-ES", zh: "zh-CN" };
  const selector = document.getElementById("verification-language");
  const statusNode = document.getElementById("verification-status");
  const recordNode = document.getElementById("verification-record");
  const retry = document.getElementById("verification-retry");
  const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
  let language = Object.hasOwn(copy, requestedLanguage) ? requestedLanguage : "ar";
  let state = "loading";
  let record = null;
  let requestId = 0;
  let client;

  function render() {
    const text = copy[language];
    document.documentElement.lang = language === "zh" ? "zh-CN" : language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.title = `${text.title} | WEEXEY`;
    selector.value = language;
    document.querySelectorAll("[data-copy]").forEach((node) => { node.textContent = text[node.dataset.copy]; });
    statusNode.textContent = text[state];
    statusNode.dataset.state = state;
    recordNode.hidden = !record;
    retry.hidden = state !== "error";
    if (record) {
      document.getElementById("verification-number").textContent = record.invoice_number;
      document.getElementById("verification-date").textContent =
        new Intl.DateTimeFormat(locale[language], { dateStyle: "medium", timeStyle: "short" }).format(new Date(record.issued_at));
      document.getElementById("verification-order-status").textContent = text.statuses[statuses.indexOf(record.status)];
    }
  }

  async function verify() {
    const currentRequest = ++requestId;
    const token = window.location.hash.slice(1);
    record = null;
    if (!/^[0-9a-f]{64}$/.test(token)) {
      state = "invalid";
      render();
      return;
    }
    state = "loading";
    render();
    try {
      const config = window.RUQO_SUPABASE_CONFIG;
      if (!config?.url || !config?.publishableKey || !window.supabase?.createClient) {
        throw new Error("Invoice verification client is not configured.");
      }
      if (!client) client = window.supabase.createClient(config.url, config.publishableKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: "ruqo-invoice-verification" },
      });
      const { data, error } = await client.rpc("verify_invoice", { p_token: token })
        .abortSignal(AbortSignal.timeout(15000));
      if (error) throw new Error("Invoice verification request failed.");
      if (currentRequest !== requestId) return;
      if (data !== null && (
        !data || typeof data.invoice_number !== "string" || !data.invoice_number.startsWith("INV-") ||
        data.invoice_number.length > 128 || typeof data.issued_at !== "string" ||
        !Number.isFinite(Date.parse(data.issued_at)) || !statuses.includes(data.status)
      )) throw new Error("Invalid invoice verification response.");
      record = data;
      state = !record ? "missing" : ["cancelled", "refunded"].includes(record.status) ? "cancelled" : "found";
    } catch (error) {
      if (currentRequest !== requestId) return;
      console.error("Invoice verification failed:", error.message);
      state = "error";
    }
    render();
  }

  selector.addEventListener("change", () => { language = selector.value; render(); });
  retry.addEventListener("click", verify);
  window.addEventListener("hashchange", verify);
  void verify();
})();
