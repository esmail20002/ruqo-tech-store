(() => {
  window.RUQO_SUPPORT_CONTENT_SCHEMA = {
    languages: ["en", "ar", "fr", "es", "zh"],
    copyFields: [
      { id: "helpTitle", label: "Page title" },
      { id: "intro", label: "Introduction" },
      { id: "policiesLabel", label: "Policies heading" },
      { id: "faqTitle", label: "FAQ heading" },
    ],
    sections: [
      { id: "account-help", kind: "policy", icon: "clipboard-list", titleKey: "accountTitle", bodyKey: "accountBody", label: "Orders and account" },
      { id: "delivery", kind: "policy", icon: "truck", titleKey: "deliveryTitle", bodyKey: "deliveryBody", label: "Delivery" },
      { id: "payment", kind: "policy", icon: "wallet-cards", titleKey: "paymentsTitle", bodyKey: "paymentBody", label: "Payment" },
      { id: "returns", kind: "policy", icon: "package-check", titleKey: "returnsTitle", bodyKey: "returnsBody", label: "Returns and warranty" },
      { id: "terms", kind: "legal", icon: "file-text", eyebrowKey: "terms", titleKey: "termsTitle", bodyKey: "termsBody", label: "Terms" },
      { id: "privacy", kind: "legal", icon: "shield-check", eyebrowKey: "privacy", titleKey: "privacyTitle", bodyKey: "privacyBody", label: "Privacy" },
    ],
    faqs: [
      { id: "faq-delivery", questionKey: "faqDelivery", answerKey: "faqDeliveryAnswer", label: "Delivery time" },
      { id: "faq-payment", questionKey: "paymentsTitle", answerKey: "faqPaymentAnswer", label: "Payment" },
      { id: "faq-return", questionKey: "faqReturn", answerKey: "faqReturnAnswer", label: "Returns" },
      { id: "faq-warranty", questionKey: "faqWarranty", answerKey: "faqWarrantyAnswer", label: "Warranty" },
      { id: "faq-account", questionKey: "accountTitle", answerKey: "faqAccountAnswer", label: "Orders and account" },
      { id: "faq-contact", questionKey: "contactTitle", answerKey: "faqContactAnswer", label: "Contact" },
    ],
    orderingSteps: [
      { id: "choose-items", icon: "shopping-bag", titleKey: "flowOne", bodyKey: "flowOneText", label: "Step 1" },
      { id: "confirm-details", icon: "clipboard-check", titleKey: "flowTwo", bodyKey: "flowTwoText", label: "Step 2" },
      { id: "pay-on-delivery", icon: "banknote", titleKey: "flowThree", bodyKey: "flowThreeText", label: "Step 3" },
    ],
    icons: ["truck", "wallet-cards", "package-check", "clipboard-list", "file-text", "shield-check", "circle-help", "credit-card", "refresh-cw", "map-pin", "shopping-bag", "clipboard-check", "banknote"],
  };
  const isRecord = (value) => value && typeof value === "object" && !Array.isArray(value);
  const emptyTranslations = () => Object.fromEntries(window.RUQO_SUPPORT_CONTENT_SCHEMA.languages.map((language) => [language, {}]));
  const normalizeTranslations = (value, fields, maxLengths) => {
    const source = isRecord(value) ? value : {};
    return Object.fromEntries(window.RUQO_SUPPORT_CONTENT_SCHEMA.languages.map((language) => {
      const sourceLanguage = isRecord(source[language]) ? source[language] : {};
      const translations = {};
      for (const field of fields) {
        translations[field] = typeof sourceLanguage[field] === "string"
          ? sourceLanguage[field].slice(0, maxLengths[field])
          : "";
      }
      return [language, translations];
    }));
  };
  const defaultData = () => ({
    version: 1,
    translations: emptyTranslations(),
    sections: window.RUQO_SUPPORT_CONTENT_SCHEMA.sections.map((section) => ({ ...section, translations: emptyTranslations() })),
    faqs: window.RUQO_SUPPORT_CONTENT_SCHEMA.faqs.map((faq) => ({ ...faq, translations: emptyTranslations() })),
    ordering: {
      translations: normalizeTranslations({}, ["eyebrow", "title"], { eyebrow: 200, title: 200 }),
      steps: window.RUQO_SUPPORT_CONTENT_SCHEMA.orderingSteps.map((step) => ({ ...step, translations: emptyTranslations() })),
    },
  });
  const normalizeList = (items, descriptors, itemFields, maxLengths) => {
    if (!Array.isArray(items)) {
      return descriptors.map((entry) => ({ ...entry, translations: emptyTranslations() }));
    }
    const defaults = new Map(descriptors.map((entry) => [entry.id, entry]));
    const usedIds = new Set();
    return items.slice(0, itemFields === "section" ? 40 : 60).flatMap((entry) => {
      if (!isRecord(entry)) return [];
      const id = typeof entry.id === "string" && /^[a-z0-9][a-z0-9_-]{1,63}$/.test(entry.id) ? entry.id : "";
      if (!id || usedIds.has(id)) return [];
      usedIds.add(id);
      const original = defaults.get(id);
      const fields = itemFields === "section" ? ["title", "body"] : ["question", "answer"];
      const translations = normalizeTranslations(entry.translations, fields, maxLengths);
      if (original) return [{ ...original, translations }];
      if (itemFields === "section") {
        return [{
          id,
          kind: entry.kind === "legal" ? "legal" : "policy",
          icon: window.RUQO_SUPPORT_CONTENT_SCHEMA.icons.includes(entry.icon) ? entry.icon : "circle-help",
          label: "Custom section",
          custom: true,
          translations,
        }];
      }
      return [{ id, label: "Custom question", custom: true, translations }];
    });
  };
  const normalizeOrdering = (value) => {
    const source = isRecord(value) ? value : {};
    const descriptors = window.RUQO_SUPPORT_CONTENT_SCHEMA.orderingSteps;
    const defaults = new Map(descriptors.map((step) => [step.id, step]));
    const items = Array.isArray(source.steps) ? source.steps.slice(0, 12) : descriptors;
    const usedIds = new Set();
    const steps = items.flatMap((entry) => {
      if (!isRecord(entry)) return [];
      const id = typeof entry.id === "string" && /^[a-z0-9][a-z0-9_-]{1,63}$/.test(entry.id) ? entry.id : "";
      if (!id || usedIds.has(id)) return [];
      usedIds.add(id);
      const original = defaults.get(id);
      const translations = normalizeTranslations(entry.translations, ["title", "body"], { title: 200, body: 2000 });
      if (original) {
        return [{
          ...original,
          icon: window.RUQO_SUPPORT_CONTENT_SCHEMA.icons.includes(entry.icon) ? entry.icon : original.icon,
          translations,
        }];
      }
      return [{
        id,
        icon: window.RUQO_SUPPORT_CONTENT_SCHEMA.icons.includes(entry.icon) ? entry.icon : "circle-help",
        label: "Custom step",
        custom: true,
        translations,
      }];
    });
    return {
      translations: normalizeTranslations(source.translations, ["eyebrow", "title"], { eyebrow: 200, title: 200 }),
      steps,
    };
  };
  window.RUQO_NORMALIZE_SUPPORT_CONTENT = (value) => {
    if (!isRecord(value)) return defaultData();
    const schema = window.RUQO_SUPPORT_CONTENT_SCHEMA;
    return {
      version: 1,
      translations: normalizeTranslations(value.translations, schema.copyFields.map((field) => field.id), {
        helpTitle: 200,
        intro: 1200,
        policiesLabel: 200,
        faqTitle: 200,
      }),
      sections: normalizeList(value.sections, schema.sections, "section", { title: 200, body: 6000 }),
      faqs: normalizeList(value.faqs, schema.faqs, "faq", { question: 300, answer: 3000 }),
      ordering: normalizeOrdering(value.ordering),
    };
  };
})();
