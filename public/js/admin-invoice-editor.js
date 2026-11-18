(() => {
  const generator = window.WEEXEY_INVOICE;
  const sample = {
    orderNumber: "SAMPLE-0001",
    createdAt: "2026-11-16T12:00:00Z",
    customerName: "Sample Customer",
    phone: "+000 000 000",
    email: "customer@example.com",
    address: "Sample Street",
    city: "Sample City",
    notes: "Sample delivery instructions",
    subtotal: 200,
    discountTotal: 10,
    shippingTotal: 20,
    total: 210,
    items: [{ id: "sample", name: "Sample Product", brand: "Store", variant: "Standard", quantity: 2, price: 100 }],
  };
  const titles = {
    header: "Company header", metadata: "Order information", parties: "Seller & customer",
    items: "Product table", totals: "Financial summary", policies: "Policies", footer: "Signatures & footer",
    logo: "Company logo", watermark: "Watermark", status: "Order status",
    orderNumber: "Order reference", payment: "Payment method", supply: "Estimated delivery",
    seller: "Seller details", phone: "Customer phone", email: "Customer email", address: "Delivery address",
    notes: "Delivery notes", brand: "Product brand", variant: "Product variant", warranty: "Product warranty note",
    verification: "Verification panel", cod: "Collection on delivery note",
    signatures: "Signature area", seal: "Company seal", barcode: "Barcode",
    index: "Row number", sku: "SKU", description: "Product description", quantity: "Quantity",
    unitPrice: "Unit price excluding VAT", vatRate: "VAT rate", vatAmount: "VAT amount", total: "Line total",
    companyLegalName: "Company name", companyBranch: "Branch or office", companyAddress: "Company address",
    invoiceMainTitle: "Invoice title", invoiceSubtitle: "Subtitle", invoiceBadge: "Header badge text",
    crLabel: "Registration number label", trnLabel: "Tax number label", supportEmailLabel: "Billing email label",
    metaInvoiceNo: "Invoice number label", metaOrderNo: "Order number label", metaIssueDate: "Issue date label",
    metaPaymentMethod: "Payment method label", metaPaymentVal: "Payment description",
    metaSupplyDate: "Delivery estimate label", metaSupplyVal: "Delivery estimate", metaCurrency: "Currency label",
    statusConfirmed: "Confirmed status text", statusShipped: "Shipped status text",
    statusDelivered: "Delivered status text", statusCancelled: "Cancelled status text",
    sellerBoxTitle: "Seller section title", buyerBoxTitle: "Customer section title",
    sellerTag: "Seller badge text", sellerStoreName: "Seller display name", buyerTag: "Customer badge text",
    customerNameLabel: "Customer name label", customerPhoneLabel: "Phone label", customerEmailLabel: "Email label",
    customerCityLabel: "City label", customerAddressLabel: "Address label", customerNotesLabel: "Delivery notes label",
    notProvided: "Text for missing information", tableSectionTitle: "Products section title",
    colIndex: "Row number heading", colSku: "SKU heading", colDescription: "Product heading", colQty: "Quantity heading",
    colUnitExcl: "Unit price heading", colVatRate: "Tax rate heading", colVatAmount: "Tax amount heading",
    colLineTotal: "Line total heading", serialWarrantyNote: "Warranty note below each product",
    summarySectionTitle: "Summary section title", sumExclVat: "Subtotal label", sumDiscount: "Discount label",
    sumShipping: "Shipping label", sumFreeShipping: "Free shipping text", sumVatTotal: "Tax total label",
    sumGrandTotal: "Grand total label", sumCodNote: "Cash on delivery note",
    verificationBoxTitle: "Verification section title", qrCaption: "QR instructions",
    qrUnavailable: "Message when verification is unavailable", authCodeLabel: "Invoice reference label",
    policiesHeaderTitle: "Policies section heading", policiesHeaderCode: "Policy reference text",
    sigSellerTitle: "Seller signature heading", sigSellerRole: "Seller signature description",
    sigStampTop: "Seal top line", sigStampCenter: "Seal middle line", sigStampBottom: "Seal bottom line",
    sigBuyerTitle: "Customer signature heading", sigBuyerNameLine: "Recipient name label",
    sigBuyerSignLine: "Signature label", sigBuyerDateLine: "Delivery date label",
    footerLegalLine: "Footer text", pageIndicator: "Page number text",
    docTitle: "Browser window title", previewBarTitle: "Preview toolbar title",
    previewBarSub: "Preview toolbar description", previewBrandText: "Preview brand text",
    downloadPdfBtn: "Download button text", downloadingBtn: "Download progress text",
    printNowBtn: "Print button text", closePreviewBtn: "Close button text", watermarkText: "Watermark text",
  };
  for (let index = 1; index <= 4; index++) {
    titles[`policy${index}Title`] = "Policy title";
    titles[`policy${index}Body`] = "Policy text";
  }
  const detailLabelGroups = [
    ["registration-labels", "Registration labels", ["crLabel", "trnLabel", "supportEmailLabel"]],
    ["order-labels", "Order labels", ["metaInvoiceNo", "metaOrderNo", "metaIssueDate", "metaPaymentMethod", "metaSupplyDate", "metaCurrency"]],
    ["status-text", "Order status text", ["statusConfirmed", "statusShipped", "statusDelivered", "statusCancelled"]],
    ["customer-labels", "Seller & customer labels", ["sellerBoxTitle", "buyerBoxTitle", "sellerTag", "sellerStoreName", "buyerTag", "customerNameLabel", "customerPhoneLabel", "customerEmailLabel", "customerCityLabel", "customerAddressLabel", "customerNotesLabel", "notProvided"]],
    ["product-labels", "Product table headings", ["tableSectionTitle", "colIndex", "colSku", "colDescription", "colQty", "colUnitExcl", "colVatRate", "colVatAmount", "colLineTotal"]],
    ["summary-labels", "Financial summary labels", ["summarySectionTitle", "sumExclVat", "sumDiscount", "sumShipping", "sumFreeShipping", "sumVatTotal", "sumGrandTotal", "sumCodNote"]],
    ["preview-labels", "Preview & download wording", ["docTitle", "previewBarTitle", "previewBarSub", "previewBrandText", "downloadPdfBtn", "downloadingBtn", "printNowBtn", "closePreviewBtn"]],
  ];
  const panes = {
    details: ["Invoice details", "Company information and the main wording on your invoice."],
    policies: ["Policies & footer", "Edit your policies, signature wording and footer."],
    design: ["Design", "Adjust the look. Less-used layout options are under Advanced settings."],
  };
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const label = (key) => titles[key] || key.replace(/([a-z])([A-Z0-9])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
  let root;
  let hooks;
  let draft;
  let savedSnapshot;
  let language = "en";
  let pane = "details";
  let dirty = false;
  let saving = false;
  let previewTimer;
  let previewZoom = "fit";
  const disclosureState = new Map();

  function feedback(message, error = false) {
    const node = root.querySelector("[data-invoice-feedback]");
    node.textContent = message;
    node.classList.toggle("is-error", error);
  }

  function updateDirty() {
    dirty = JSON.stringify(draft) !== savedSnapshot;
    feedback(dirty ? "Unsaved changes - not published." : "All changes saved.");
    root.querySelector("[data-invoice-save]").disabled = !dirty || saving;
  }

  function updatePreviewLayout() {
    const viewport = root.querySelector("[data-invoice-preview-viewport]");
    if (!viewport.clientWidth) return;
    const scale = previewZoom === "fit"
      ? Math.min(1, (viewport.clientWidth - 16) / 810, (viewport.clientHeight - 16) / 1220)
      : Number(previewZoom) / 100;
    const frame = root.querySelector("iframe");
    const size = root.querySelector("[data-invoice-preview-size]");
    frame.style.transform = `scale(${scale})`;
    size.style.width = `${810 * scale}px`;
    size.style.height = `${1220 * scale}px`;
    root.querySelectorAll("[data-invoice-zoom]").forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.invoiceZoom === previewZoom)));
  }

  function updatePreview() {
    clearTimeout(previewTimer);
    const frame = root.querySelector("iframe");
    try {
      frame.srcdoc = generator.createDocumentHtml(sample, { language, customConfig: draft, embedded: true });
      frame.onload = updatePreviewLayout;
      updatePreviewLayout();
    } catch (error) {
      feedback(`Preview failed: ${error.message}`, true);
    }
  }

  function textInput(key, value) {
    const multiline = /Body|Address|Line|Sub|Caption|Note|Unavailable/.test(key);
    const direction = language === "ar" ? "rtl" : "ltr";
    return `<label>${escape(label(key))}${multiline
      ? `<textarea dir="${direction}" data-invoice-text="${key}" rows="${/Body/.test(key) ? 5 : 2}" maxlength="3000">${escape(value)}</textarea>`
      : `<input dir="${direction}" data-invoice-text="${key}" value="${escape(value)}" maxlength="500">`}</label>`;
  }

  function textFields(keys, copy) {
    return keys.map((key) => textInput(key, copy[key])).join("");
  }

  function group(key, title, content, note = "", collapsible = false, open = false) {
    const heading = `<span>${escape(title)}</span>`;
    const body = `${note ? `<p class="invoice-editor-note">${escape(note)}</p>` : ""}<div class="invoice-editor-fields">${content}</div>`;
    return collapsible
      ? `<details class="invoice-editor-group" data-invoice-group="${key}" ${open ? "open" : ""}><summary>${heading}</summary>${body}</details>`
      : `<section class="invoice-editor-group" aria-label="${escape(title)}"><h3>${heading}</h3>${body}</section>`;
  }

  function rememberDisclosures() {
    root.querySelectorAll("[data-invoice-group]").forEach((node) => disclosureState.set(node.dataset.invoiceGroup, node.open));
  }

  function setPane(next) {
    pane = next;
    root.querySelectorAll("[data-invoice-pane]").forEach((node) =>
      node.setAttribute("aria-pressed", String(node.dataset.invoicePane === pane)));
    renderFields();
  }

  function orderedControls(keys, collection, allowHide = false) {
    return keys.map((key, index) => `<div class="invoice-order-row">
      ${allowHide ? `<input type="checkbox" data-invoice-column="${key}" aria-label="Show ${escape(label(key))}" ${draft.hiddenColumns.includes(key) ? "" : "checked"} ${generator.requiredColumns.includes(key) ? "disabled" : ""}>` : ""}
      <span>${escape(label(key))}</span>
      <button type="button" class="admin-secondary-button" data-invoice-move="${collection}:${key}:-1" aria-label="Move ${escape(label(key))} up" ${index === 0 ? "disabled" : ""}>&uarr;</button>
      <button type="button" class="admin-secondary-button" data-invoice-move="${collection}:${key}:1" aria-label="Move ${escape(label(key))} down" ${index === keys.length - 1 ? "disabled" : ""}>&darr;</button>
    </div>`).join("");
  }

  function renderFields() {
    rememberDisclosures();
    const copy = generator.resolveCopyWithCustomConfig(draft, language);
    const fields = root.querySelector("[data-invoice-fields]");
    root.querySelector("[data-invoice-pane-title]").textContent = panes[pane][0];
    root.querySelector("[data-invoice-pane-description]").textContent = panes[pane][1];
    fields.dir = "ltr";
    if (pane === "details") {
      fields.innerHTML = `
        ${group("company", "Company information", textFields(["companyLegalName", "companyBranch", "companyAddress"], copy))}
        ${group("heading", "Invoice heading", textFields(["invoiceMainTitle", "invoiceSubtitle", "invoiceBadge"], copy))}
        ${group("registration", "Registration & contact", `
          <label>Tax registration number<input data-invoice-shared="trn_number" value="${escape(draft.trn_number ?? copy.trnNumber)}" maxlength="60" required></label>
          <label>Commercial registration number<input data-invoice-shared="cr_number" value="${escape(draft.cr_number ?? copy.crNumber)}" maxlength="60" required></label>
          <label>Billing email<input type="email" data-invoice-shared="billing_email" value="${escape(draft.billing_email ?? copy.supportEmail)}" maxlength="254" required></label>
        `, "Appears in the invoice header and seller details.", true)}
        ${group("logo", "Company logo", `
          <label>Logo image URL<input type="url" data-invoice-shared="logoUrl" value="${escape(draft.logoUrl)}" placeholder="https://..." maxlength="2048"></label>
          <label>Logo height (px)<input type="number" data-invoice-style="logoHeight" min="20" max="64" step="1" value="${draft.appearance.logoHeight}" required></label>
        `, "Leave the URL empty to use the store's default logo.", true)}
        ${group("order-description", "Payment & delivery wording", textFields(["metaPaymentVal", "metaSupplyVal"], copy),
          "Printed descriptions only. This does not change payment processing or delivery settings.", true)}
        <aside class="invoice-editor-callout"><strong>Automatic QR verification</strong><p>The QR comes from the order record when verification is available. Sample previews do not have a real QR. You do not need to enter or upload a code here.</p></aside>
        ${group("advanced-wording", "Advanced wording", detailLabelGroups.map(([key, title, keys]) =>
          group(key, title, textFields(keys, copy), "", true)).join(""),
          "Optional: rename printed labels and preview buttons. These fields do not edit customer data, prices or order numbers.", true)}`;
    } else if (pane === "policies") {
      fields.innerHTML = `
        ${group("policy-heading", "Policies heading", textFields(["policiesHeaderTitle"], copy))}
        ${["Warranty", "Returns & exchanges", "Delivery & receipt", "Electronic invoice"].map((title, index) =>
          group(`policy-${index + 1}`, `${title} policy`, textFields([
            `policy${index + 1}Title`, `policy${index + 1}Body`, ...(index === 0 ? ["serialWarrantyNote"] : []),
          ], copy), "", true, index === 0)).join("")}
        ${group("footer", "Footer & signatures", textFields(["footerLegalLine", "sigSellerTitle", "sigSellerRole", "sigBuyerTitle"], copy), "", true)}
        ${group("advanced-policy-wording", "Advanced wording", `
          ${group("policy-reference", "Policy reference", textFields(["policiesHeaderCode"], copy))}
          ${group("verification-wording", "QR verification wording", textFields(["verificationBoxTitle", "qrCaption", "qrUnavailable", "authCodeLabel"], copy),
            "Text only. This does not change the QR destination or verify tax compliance or warranty eligibility.")}
          ${group("signature-labels", "Signature & seal labels", textFields(["sigBuyerNameLine", "sigBuyerSignLine", "sigBuyerDateLine", "sigStampTop", "sigStampCenter", "sigStampBottom", "pageIndicator"], copy))}
        `, "Less-used reference, verification and signature labels.", true)}`;
    } else {
      const a = draft.appearance;
      fields.innerHTML = `
        ${group("colors", "Colors", `<div class="invoice-editor-color-grid">${[
          ["accent", "Primary accent"], ["secondary", "Secondary accent"], ["ink", "Text color"],
        ].map(([key, title]) => `<label>${title}<input type="color" data-invoice-style="${key}" value="${a[key]}"></label>`).join("")}</div>`,
          "The invoice header stays white. Accent colors apply to the rest of the invoice.")}
        ${group("type", "Text appearance", `
          <label>Font family<select data-invoice-style="font">${["Cairo", "Manrope", "Arial", "Georgia"].map((font) => `<option ${a.font === font ? "selected" : ""}>${font}</option>`).join("")}</select></label>
          <label>Text size (%)<input type="number" data-invoice-style="fontScale" data-invoice-percent min="80" max="130" step="any" value="${Math.round(a.fontScale * 10000) / 100}" required></label>
        `, "100% is the standard size. Larger text may need more A4 scaling.")}
        ${group("advanced-design", "Advanced settings", `
          ${group("spacing", "Page spacing", `
            <label>Space between sections (px)<input type="number" data-invoice-style="spacing" min="4" max="18" step="1" value="${a.spacing}" required></label>
            <label>Page margins (mm)<input type="number" data-invoice-style="padding" min="4" max="14" step="1" value="${a.padding}" required></label>
            ${textFields(["watermarkText"], copy)}
          `, "Portrait A4 is fixed. Long content is scaled, not cut off.")}
          ${group("visible-fields", "Show or hide information", generator.visibilityKeys.map((key) =>
            `<label class="invoice-toggle"><input type="checkbox" data-invoice-visible="${key}" ${draft.visibility[key] ? "checked" : ""}>${escape(key === "footer" ? "Footer text" : label(key))}</label>`).join(""),
            "Invoice number, issue date, customer name and financial totals always remain visible.", true)}
          ${group("section-order", "Section order", orderedControls(draft.sections, "sections"),
            "Use the arrows to move whole sections up or down.", true)}
          ${group("product-columns", "Product table columns", orderedControls(draft.columns, "columns", true),
            "Check optional columns to show them. Description, quantity and total are always included. Use the arrows to reorder columns.", true)}
          ${group("defaults", "Restore defaults", `<button type="button" class="admin-secondary-button" data-invoice-reset>Restore all invoice defaults</button>`,
            "Resets all wording and design settings in your draft. Nothing is published until you save.", true)}
        `, "Spacing, optional information, section order and table columns. Your existing settings are preserved.", true)}`;
    }
    root.querySelectorAll("[data-invoice-group]").forEach((node) => {
      if (disclosureState.has(node.dataset.invoiceGroup)) node.open = disclosureState.get(node.dataset.invoiceGroup);
    });
  }

  function render() {
    rememberDisclosures();
    root.innerHTML = `
      <div class="admin-page-heading invoice-editor-heading">
        <div><span class="admin-eyebrow">INVOICE WORKSPACE</span><h1>Invoice Editor</h1><p>Three simple sections. One live preview. Changes are published only when you save.</p></div>
        <div class="invoice-editor-header-actions">
          <div class="invoice-editor-header-buttons">
            <button type="button" class="admin-secondary-button" data-invoice-back>Back to orders</button>
            <button type="submit" form="invoice-settings-form" class="admin-primary-button" data-invoice-save>Save changes</button>
          </div>
          <span data-invoice-feedback role="status" aria-live="polite"></span>
        </div>
      </div>
      <form id="invoice-settings-form">
        <div class="invoice-editor-layout">
          <section class="admin-section invoice-editor-controls">
            <nav class="invoice-editor-tabs" aria-label="Invoice editor sections">
              ${Object.entries(panes).map(([key, [title]], index) => `<button class="admin-secondary-button" type="button" data-invoice-pane="${key}" aria-pressed="${pane === key}"><span class="invoice-editor-step">${index + 1}</span>${title}</button>`).join("")}
            </nav>
            <h2 data-invoice-pane-title></h2><p class="invoice-editor-note" data-invoice-pane-description></p>
            <div class="invoice-editor-fields" data-invoice-fields></div>
          </section>
          <section class="admin-section invoice-editor-preview">
            <div class="invoice-editor-preview-heading"><div><h2>Live preview</h2><p class="invoice-editor-note">Portrait A4 &middot; Sample order</p></div>
              <button type="button" class="admin-secondary-button" data-invoice-preview>Full preview</button>
            </div>
            <div class="invoice-editor-preview-body">
              <div class="invoice-editor-preview-viewport" data-invoice-preview-viewport>
                <div class="invoice-editor-preview-size" data-invoice-preview-size><iframe title="Live invoice preview" sandbox="allow-scripts"></iframe></div>
              </div>
              <div class="invoice-editor-zoom" role="group" aria-label="Preview zoom">
                ${["fit", "100", "125"].map((value) => `<button type="button" class="admin-secondary-button" data-invoice-zoom="${value}" aria-pressed="${previewZoom === value}">${value === "fit" ? "Fit page" : `${value}%`}</button>`).join("")}
              </div>
            </div>
            <p class="invoice-editor-note">Zoom in to read details. Scroll inside this preview when enlarged. Preview zoom does not change the printed invoice.</p>
          </section>
        </div>
      </form>`;
    renderFields();
    updateDirty();
    updatePreview();
  }

  function canLeave() {
    if (saving) return false;
    if (!dirty) return true;
    if (!window.confirm("لديك تعديلات غير محفوظة على الفاتورة. هل تريد مغادرة الصفحة دون حفظها؟")) return false;
    dirty = false;
    return true;
  }

  function bind(options) {
    if (root) return;
    hooks = options;
    root = document.getElementById("invoice-editor-root");
    root.addEventListener("input", (event) => {
      const input = event.target;
      if (input.dataset.invoiceText) {
        draft.texts ||= {};
        draft.texts[language] ||= {};
        draft.texts[language][input.dataset.invoiceText] = input.value;
      } else if (input.dataset.invoiceShared) {
        draft[input.dataset.invoiceShared] = input.value.trim();
      } else if (input.dataset.invoiceStyle) {
        const key = input.dataset.invoiceStyle;
        draft.appearance[key] = input.type === "number" ? Number(input.value) : input.value;
        if ("invoicePercent" in input.dataset) draft.appearance[key] /= 100;
      } else if (input.dataset.invoiceVisible) {
        draft.visibility[input.dataset.invoiceVisible] = input.checked;
      } else if (input.dataset.invoiceColumn) {
        const key = input.dataset.invoiceColumn;
        draft.hiddenColumns = draft.hiddenColumns.filter((value) => value !== key);
        if (!input.checked) draft.hiddenColumns.push(key);
      } else return;
      updateDirty();
      clearTimeout(previewTimer);
      previewTimer = setTimeout(updatePreview, 300);
    });
    root.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button || saving) return;
      if (button.hasAttribute("data-invoice-back")) hooks.setView("orders");
      if (button.dataset.invoicePane) setPane(button.dataset.invoicePane);
      if (button.dataset.invoiceZoom) {
        previewZoom = button.dataset.invoiceZoom;
        updatePreviewLayout();
      }
      if (button.dataset.invoiceMove) {
        const [collection, key, delta] = button.dataset.invoiceMove.split(":");
        const index = draft[collection].indexOf(key);
        const target = index + Number(delta);
        if (target < 0 || target >= draft[collection].length) return;
        [draft[collection][index], draft[collection][target]] = [draft[collection][target], draft[collection][index]];
        renderFields();
        updateDirty();
        updatePreview();
      }
      if (button.hasAttribute("data-invoice-reset") && window.confirm("هل تريد استعادة إعدادات الفاتورة الافتراضية؟ لن تُطبق إلا بعد الحفظ.")) {
        draft = generator.normalizeCustomConfig({});
        renderFields();
        updateDirty();
        updatePreview();
      }
      if (button.hasAttribute("data-invoice-preview")) {
        generator.openOfficialInvoice(sample, { language, customConfig: draft });
      }
    });
    root.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (saving || !dirty) return;
      const normalized = generator.normalizeCustomConfig(draft);
      if (Object.keys(draft.appearance).some((key) => draft.appearance[key] !== normalized.appearance[key])) {
        feedback("Check design values: text size 80–130%, section spacing 4–18px, margins 4–14mm, logo height 20–64px.", true);
        return;
      }
      if (["trn_number", "cr_number", "billing_email"].some((key) => draft[key] !== undefined && !draft[key]) ||
          (draft.billing_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.billing_email))) {
        feedback("Check Registration & contact in Invoice details: registration numbers and a valid billing email are required.", true);
        return;
      }
      const logo = draft.logoUrl;
      if (logo && !generator.normalizeCustomConfig(draft).logoUrl) {
        feedback("Use an HTTPS logo URL or a local image URL from this site.", true);
        return;
      }
      saving = true;
      root.querySelectorAll("input, textarea, select, button").forEach((node) => { node.disabled = true; });
      const pending = generator.normalizeCustomConfig(JSON.parse(JSON.stringify(draft)));
      feedback("Saving invoice settings...");
      try {
        await hooks.save(pending);
        draft = JSON.parse(JSON.stringify(pending));
        savedSnapshot = JSON.stringify(draft);
        dirty = false;
        render();
        feedback(hooks.isDemo() ? "Saved in this local demo only." : "Invoice settings saved for customers and admin.");
      } catch (error) {
        render();
        feedback(`Save failed. Your draft is preserved: ${error.message}`, true);
      } finally {
        saving = false;
        root.querySelector("[data-invoice-save]").disabled = !dirty;
      }
    });
    window.addEventListener("beforeunload", (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    });
    window.addEventListener("resize", updatePreviewLayout);
  }

  function open() {
    if (!canLeave()) return;
    draft = generator.normalizeCustomConfig(JSON.parse(JSON.stringify(hooks.getConfig() || {})));
    savedSnapshot = JSON.stringify(draft);
    dirty = false;
    pane = "details";
    previewZoom = "fit";
    hooks.setView("invoice-settings");
    render();
  }

  window.RUQO_INVOICE_EDITOR = { bind, open, canLeave };
})();
