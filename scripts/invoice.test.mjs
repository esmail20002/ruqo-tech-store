import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import qrcode from "qrcode-generator";
import jsQR from "jsqr";

const source = fs.readFileSync(new URL("../public/js/invoice-generator.js", import.meta.url), "utf8");
function load(language = "ar", config = {}) {
  const window = {
    location: { origin: "https://www.ruqo.pro" },
    RUQO_STORE_SETTINGS: { invoice_config: config },
    NoursStore: { getLanguage: () => language, getCurrency: () => "SAR" },
    qrcode,
  };
  vm.runInNewContext(source, { window, URL, console, Intl, localStorage: { getItem: () => null } });
  return window.WEEXEY_INVOICE;
}
const order = {
  orderNumber: "TEST-42", createdAt: "2026-11-16T12:00:00Z",
  customerName: "Example", total: 230,
  items: [{ name: "Laptop", nameTranslations: { ar: "حاسوب", fr: "Ordinateur" }, quantity: 2, price: 115 }],
};

test("invoice always renders in English (LTR) regardless of storefront or requested language", () => {
  const api = load("ar");
  assert.match(api.createDocumentHtml(order), /<html lang="en" dir="ltr">/);
  assert.match(api.createDocumentHtml(order), /Laptop/);
  assert.doesNotMatch(api.createDocumentHtml(order), /onchange="changeInvoiceLanguage/);
  for (const lang of ["ar", "en", "fr", "es", "zh"]) {
    const html = api.createDocumentHtml(order, { language: lang });
    assert.match(html, /<html lang="en" dir="ltr">/);
    assert.match(html, /INV-TEST-42/);
    assert.match(html, /230\.00/);
  }
});

test("legacy settings and English custom text apply correctly", () => {
  const api = load("en", {
    company_name_en: "Legacy Company",
    policy1_body_en: "Legacy warranty",
    trn_number: "123456",
    texts: { ar: { companyLegalName: "شركة مثال" } },
  });
  const html = api.createDocumentHtml(order, { language: "ar" });
  assert.match(html, /Legacy Company/);
  assert.match(html, /Legacy warranty/);
  assert.match(html, /123456/);
  assert.doesNotMatch(html, /<h2 class="inv-company-name">شركة مثال<\/h2>/);
});

test("PDF capture isolates the full sheet and restores the phone preview on success or failure", async () => {
  for (const fail of [false, true]) {
    const html = load("en").createDocumentHtml(order);
    const start = html.indexOf("async function downloadSinglePagePdf()");
    const script = html.slice(start, html.indexOf("</script>", start));
    const sheet = { offsetHeight: 1050, style: { transform: "scale(0.47)" } };
    const stage = { style: { height: "520px" } };
    const button = { disabled: false };
    const label = { textContent: "Download PDF" };
    const nodes = {
      "wx-invoice-sheet": sheet, "wx-invoice-stage": stage,
      "wx-download-pdf-btn": button, "wx-download-pdf-label": label,
    };
    const exportSheet = { style: { margin: "auto", transform: "scale(0.47)", boxShadow: "shadow" } };
    const container = {
      style: { left: "115px", right: "0", margin: "auto" },
      querySelector: () => exportSheet,
    };
    let fontsReady = false;
    let fitted = false;
    let restored = false;
    let printed = 0;
    const errors = [];
    let options;
    const worker = {
      set(value) { options = value; return this; },
      from(element) { assert.equal(element, sheet); return this; },
      async save() {
        assert.ok(fontsReady && fitted);
        assert.equal(button.disabled, true);
        assert.equal(sheet.style.transform, "none");
        options.html2canvas.onclone({ querySelector: () => container });
        assert.equal(container.style.left, "0");
        assert.equal(container.style.right, "auto");
        assert.equal(container.style.margin, "0");
        assert.equal(exportSheet.style.margin, "0");
        assert.equal(exportSheet.style.transform, "none");
        assert.equal(exportSheet.style.boxShadow, "none");
        assert.equal(options.html2canvas.x, 0);
        assert.equal(options.html2canvas.y, 0);
        assert.equal(options.html2canvas.height, sheet.offsetHeight);
        if (fail) throw new Error("Capture failed");
      },
    };
    const context = {
      window: { html2pdf: () => worker, print: () => printed++ },
      document: {
        fonts: { ready: Promise.resolve().then(() => { fontsReady = true; }) },
        getElementById: (id) => nodes[id],
      },
      console: { error: (...args) => errors.push(args) },
      fitContentToA4: () => { fitted = true; },
      fitInvoiceSheetToMobileViewport: () => { restored = true; },
    };
    vm.runInNewContext(script, context);
    await context.downloadSinglePagePdf();
    assert.equal(sheet.style.transform, "scale(0.47)");
    assert.equal(stage.style.height, "520px");
    assert.equal(button.disabled, false);
    assert.equal(label.textContent, "Download PDF");
    assert.ok(restored);
    assert.equal(printed, fail ? 1 : 0);
    assert.equal(errors.length, fail ? 1 : 0);
  }
});

test("preview overrides are isolated, honor empty optional text and escape executable markup", () => {
  const api = load("en", { texts: { en: { invoiceMainTitle: "Published title" } } });
  const html = api.createDocumentHtml(order, { customConfig: {
    texts: { en: { invoiceMainTitle: "<img src=x onerror=alert(1)>", downloadingBtn: "</script><script>alert(1)</script>", invoiceSubtitle: "" } },
  } });
  assert.match(html, /&lt;img/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /<p class="inv-sub-heading"><\/p>/);
  assert.match(api.createDocumentHtml(order), /Published title/);
  for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script[1]);
});

test("layout settings cannot hide required columns, inject CSS, or duplicate/reject mandatory sections", () => {
  const api = load();
  const cfg = api.normalizeCustomConfig({
    columns: ["total", "sku", "sku", "bad"],
    hiddenColumns: ["total", "description", "quantity", "sku"],
    sections: ["footer", "footer", "unknown"],
    logoUrl: "javascript:alert(1)",
    appearance: { accent: "red;}body{display:none}", font: "evil", padding: 99, fontScale: 9 },
  });
  assert.equal(cfg.logoUrl, "");
  assert.equal(cfg.appearance.accent, "#4f46e5");
  assert.equal(cfg.appearance.font, "Cairo");
  assert.equal(cfg.appearance.padding, 14);
  assert.equal(cfg.appearance.fontScale, 1.3);
  assert.deepEqual([...cfg.hiddenColumns], ["sku"]);
  assert.equal(new Set(cfg.columns).size, 8);
  assert.equal(new Set(cfg.sections).size, 7);
  assert.equal(cfg.sections[0], "footer");
});

test("preview always opens in English and keeps the invoice identity and totals intact", () => {
  let written = "";
  const preview = {
    document: { open() {}, close() {}, write(html) { written = html; } },
    close() {},
  };
  const window = {
    location: { origin: "https://www.ruqo.pro" },
    open: () => preview,
    NoursStore: { getLanguage: () => "ar", getCurrency: () => "SAR" },
  };
  vm.runInNewContext(source, { window, URL, console, Intl, localStorage: { getItem: () => null } });
  window.WEEXEY_INVOICE.openOfficialInvoice(order);
  assert.match(written, /<html lang="en" dir="ltr">/);
  assert.match(written, /INV-TEST-42/);
  assert.match(written, /230\.00/);
});

test("editor publishes only on save and preserves an independent draft when saving fails", async () => {
  const listeners = {};
  const nodes = new Map();
  const root = {
    addEventListener(type, listener) { listeners[type] = listener; },
    querySelectorAll() { return []; },
    querySelector(selector) {
      if (!nodes.has(selector)) nodes.set(selector, { classList: { toggle() {} } });
      return nodes.get(selector);
    },
  };
  const window = { WEEXEY_INVOICE: load("en"), addEventListener() {}, confirm: () => false };
  vm.runInNewContext(
    fs.readFileSync(new URL("../public/js/admin-invoice-editor.js", import.meta.url), "utf8"),
    { window, document: { getElementById: () => root }, clearTimeout() {}, setTimeout: () => 0 },
  );
  let published = {};
  let fail = false;
  window.RUQO_INVOICE_EDITOR.bind({
    getConfig: () => published, setView() {}, isDemo: () => false,
    async save(config) {
      if (fail) throw new Error("Network unavailable");
      published = config;
    },
  });
  window.RUQO_INVOICE_EDITOR.open();
  const edit = (value) => listeners.input({ target: { dataset: { invoiceText: "companyLegalName" }, value } });
  edit("Published company");
  await listeners.submit({ preventDefault() {} });
  edit("Unsaved company");
  assert.equal(published.texts.en.companyLegalName, "Published company");
  fail = true;
  await listeners.submit({ preventDefault() {} });
  assert.equal(published.texts.en.companyLegalName, "Published company");
  assert.match(nodes.get("[data-invoice-fields]").innerHTML, /Unsaved company/);
  assert.match(nodes.get("[data-invoice-feedback]").textContent, /Save failed.*Network unavailable/);
  assert.equal(nodes.get("[data-invoice-save]").disabled, false);
  assert.equal(window.RUQO_INVOICE_EDITOR.canLeave(), false);
});

test("simplified editor gives every setting one home and preserves advanced settings across panes and languages", async () => {
  const listeners = {};
  const nodes = new Map();
  const root = {
    addEventListener(type, listener) { listeners[type] = listener; },
    querySelectorAll() { return []; },
    querySelector(selector) {
      if (!nodes.has(selector)) nodes.set(selector, { classList: { toggle() {} }, style: {} });
      return nodes.get(selector);
    },
  };
  const viewport = root.querySelector("[data-invoice-preview-viewport]");
  viewport.clientWidth = 600;
  viewport.clientHeight = 600;
  let published = {
    sections: ["footer", "header"], hiddenColumns: ["sku"],
    visibility: { phone: false }, appearance: { fontScale: 1.1, padding: 10 },
    texts: { ar: { companyLegalName: "شركة محفوظة" }, en: { companyLegalName: "Saved company" } },
  };
  const api = load("en");
  const window = { WEEXEY_INVOICE: api, addEventListener() {}, confirm: () => false };
  vm.runInNewContext(
    fs.readFileSync(new URL("../public/js/admin-invoice-editor.js", import.meta.url), "utf8"),
    { window, document: { getElementById: () => root }, clearTimeout() {}, setTimeout: () => 0 },
  );
  window.RUQO_INVOICE_EDITOR.bind({ getConfig: () => published, setView() {}, isDemo: () => false, async save(value) { published = value; } });
  window.RUQO_INVOICE_EDITOR.open();
  const click = (dataset) => {
    const button = { dataset, hasAttribute: () => false };
    listeners.click({ target: { closest: () => button } });
  };
  const controls = new Map();
  for (const pane of ["details", "policies", "design"]) {
    click({ invoicePane: pane });
    const html = nodes.get("[data-invoice-fields]").innerHTML;
    for (const input of html.matchAll(/data-invoice-(text|shared|style|visible|column)="([^"]+)"/g)) {
      const key = `${input[1]}:${input[2]}`;
      controls.set(key, (controls.get(key) || 0) + 1);
    }
  }
  assert.ok([...controls.values()].every((count) => count === 1), "No setting may have two editors");
  const expectedTextKeys = Object.entries(api.resolveCopyWithCustomConfig({}, "en"))
    .filter(([key, value]) => typeof value === "string" && !["lang", "dir", "crNumber", "trnNumber", "supportEmail"].includes(key))
    .map(([key]) => key);
  for (const key of expectedTextKeys) assert.equal(controls.get(`text:${key}`), 1, `${key} must remain editable`);
  for (const key of api.visibilityKeys) assert.equal(controls.get(`visible:${key}`), 1);
  for (const key of Object.keys(api.normalizeCustomConfig({}).appearance)) assert.equal(controls.get(`style:${key}`), 1);
  assert.equal((root.innerHTML.match(/data-invoice-pane="/g) || []).length, 3);
  assert.equal((root.innerHTML.match(/data-invoice-save/g) || []).length, 1);
  const [heading, form] = root.innerHTML.split('<form id="invoice-settings-form">');
  assert.match(heading, /data-invoice-back/);
  assert.match(heading, /form="invoice-settings-form"[^>]*data-invoice-save/);
  assert.doesNotMatch(form, /data-invoice-save/);
  assert.doesNotMatch(root.innerHTML, /class="invoice-editor-actions"/);
  assert.match(root.innerHTML, /class="invoice-editor-preview-body"/);
  assert.doesNotMatch(root.innerHTML, /data-invoice-language/);
  assert.equal((root.innerHTML.match(/data-invoice-preview>/g) || []).length, 1);
  assert.equal(nodes.get("[data-invoice-save]").disabled, true);
  assert.ok(Number.parseFloat(nodes.get("[data-invoice-preview-size]").style.height) <= viewport.clientHeight);
  click({ invoiceZoom: "125" });
  assert.equal(nodes.get("iframe").style.transform, "scale(1.25)");
  assert.equal(nodes.get("[data-invoice-save]").disabled, true, "Preview zoom must not edit invoice settings");
  click({ invoicePane: "details" });
  listeners.input({ target: { dataset: { invoiceText: "companyLegalName" }, value: "New English Company" } });
  click({ invoicePane: "design" });
  listeners.input({ target: { dataset: { invoiceStyle: "fontScale", invoicePercent: "" }, type: "number", value: "125" } });
  await listeners.submit({ preventDefault() {} });
  assert.equal(published.appearance.fontScale, 1.25);
  assert.equal(published.appearance.padding, 10);
  assert.equal(published.sections[0], "footer");
  assert.deepEqual([...published.hiddenColumns], ["sku"]);
  assert.equal(published.visibility.phone, false);
  assert.equal(published.texts.en.companyLegalName, "New English Company");
});

test("language persistence migration leaves checkout pricing, coupons and response unchanged", () => {
  const previous = fs.readFileSync(new URL("../supabase/migrations/202610170001_product_currency_checkout.sql", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const migration = fs.readFileSync(new URL("../supabase/migrations/202611160001_invoice_order_language.sql", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const rpc = previous.slice(previous.indexOf("create or replace function public.create_guest_order_with_coupon("));
  const expected = rpc.replace(
    "      shipping_total = v_shipping,\n",
    "      shipping_total = v_shipping,\n      shipping_address = shipping_address || jsonb_build_object('language', coalesce(p_customer->>'language', 'en')),\n",
  );
  assert.notEqual(expected, rpc);
  assert.equal(migration.slice(migration.indexOf("create or replace function")).trim(), expected.trim());
});

test("invoice QR decodes to its own verification link and rejects missing or unsafe tokens", () => {
  const api = load("ar");
  for (const token of ["a".repeat(64), "b".repeat(64)]) {
    const html = api.createDocumentHtml({ ...order, verificationToken: token });
    const svg = html.match(/<div class="inv-qr-svg"><a[^>]*>(<svg[\s\S]*?<\/svg>)/)?.[1];
    assert.ok(svg);
    const size = Number(svg.match(/viewBox="0 0 (\d+)/)[1]);
    const pixels = new Uint8ClampedArray(size * size * 4).fill(255);
    for (const cell of svg.matchAll(/M(\d+),(\d+)l2,0 0,2 -2,0 0,-2z/g)) {
      for (let y = Number(cell[2]); y < Number(cell[2]) + 2; y++) {
        for (let x = Number(cell[1]); x < Number(cell[1]) + 2; x++) {
          const offset = (y * size + x) * 4;
          pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = 0;
        }
      }
    }
    assert.equal(jsQR(pixels, size, size)?.data, `https://www.ruqo.pro/invoice-verify.html?lang=en#${token}`);
    assert.match(html, /rel="noopener noreferrer"/);
  }
  for (const token of [undefined, "", "TEST-42", "https://evil.example", '"><script>alert(1)</script>']) {
    const html = api.createDocumentHtml({ ...order, verificationToken: token });
    assert.doesNotMatch(html, /<div class="inv-qr-svg"><a/);
    assert.match(html, /Online verification is unavailable/);
    assert.doesNotMatch(html, /WX-AUTH-|SHA-256/);
  }
  assert.match(api.createDocumentHtml({ ...order, verificationToken: "a".repeat(64) }, { language: "fr" }),
    /invoice-verify.html\?lang=en#/);
});

test("authenticated invoice lookup resolves verification in English and does not invent verification on failure", async () => {
  let written = "";
  let resolveToken;
  const preview = { document: { open() {}, close() {}, write(html) { written = html; } }, close() {}, closed: false };
  const client = {
    auth: { async getSession() { return { data: { session: {} } }; } },
    rpc(name, args) {
      assert.equal(name, "get_invoice_verification_token");
      assert.equal(args.p_order_number, "TEST-42");
      return new Promise((resolve) => { resolveToken = resolve; });
    },
  };
  const window = { location: { origin: "https://www.ruqo.pro" }, open: () => preview, qrcode };
  const errors = [];
  vm.runInNewContext(source, { window, URL, console: { ...console, error: (...args) => errors.push(args) }, Intl, localStorage: { getItem: () => null } });
  window.WEEXEY_INVOICE.openOfficialInvoice(order, { language: "ar", verificationClient: client });
  await new Promise((resolve) => setImmediate(resolve));
  resolveToken({ data: "c".repeat(64) });
  await new Promise((resolve) => setImmediate(resolve));
  assert.match(written, /<html lang="en"/);
  assert.match(written, /invoice-verify.html\?lang=en#cccc/);
  window.WEEXEY_INVOICE.openOfficialInvoice(order, { language: "en", verificationClient: client });
  await new Promise((resolve) => setImmediate(resolve));
  resolveToken({ error: new Error("Service unavailable") });
  await new Promise((resolve) => setImmediate(resolve));
  assert.match(written, /Online verification is unavailable/);
  assert.doesNotMatch(written, /<div class="inv-qr-svg"><a/);
  assert.equal(errors.length, 1);
});
