(() => {
  const schema = window.RUQO_SUPPORT_CONTENT_SCHEMA;
  if (!schema) return;

  const SECTION_KEY = "support_content";
  const CACHE_KEY = "ruqo-support-content-cache-v1";
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
  const emptyTranslations = () => Object.fromEntries(schema.languages.map((language) => [language, {}]));

  const defaultData = () => ({
    version: 1,
    translations: emptyTranslations(),
    sections: schema.sections.map((section) => ({ ...section, translations: emptyTranslations() })),
    faqs: schema.faqs.map((faq) => ({ ...faq, translations: emptyTranslations() })),
    ordering: {
      translations: emptyTranslations(),
      steps: schema.orderingSteps.map((step) => ({ ...step, translations: emptyTranslations() })),
    },
  });
  const normalize = window.RUQO_NORMALIZE_SUPPORT_CONTENT;
  window.RUQO_INIT_SUPPORT_CONTENT_EDITOR = (client) => {
    const form = document.querySelector("#support-content-form");
    if (!client || !form) return;
    if (form.dataset.initialized === "true") return form._supportContentReady;

    const languageSelect = form.querySelector("#support-content-language");
    const copyContainer = form.querySelector("#support-content-copy");
    const orderingCopyContainer = form.querySelector("#support-content-ordering-copy");
    const orderingStepsContainer = form.querySelector("#support-content-ordering-steps");
    const sectionsContainer = form.querySelector("#support-content-sections");
    const faqsContainer = form.querySelector("#support-content-faqs");
    const feedback = form.querySelector("#support-content-feedback");
    const saveButton = form.querySelector('button[type="submit"]');
    const translateButton = form.querySelector("#translate-support-content");
    let data = defaultData();
    let loaded = false;
    let busy = false;

    const setFeedback = (message, isError = false) => {
      feedback.textContent = message;
      feedback.hidden = !message;
      feedback.classList.toggle("is-error", isError);
    };
    const renderCopyFields = () => {
      const language = languageSelect.value;
      const copy = data.translations[language];
      copyContainer.innerHTML = schema.copyFields.map((field) => `
        <label${field.id === "intro" ? ' class="form-field-wide"' : ""}>${field.label}
          ${field.id === "intro"
            ? `<textarea rows="3" maxlength="1200" data-sc-copy-field="${field.id}" placeholder="Leave blank to keep the built-in translation.">${escapeHtml(copy[field.id])}</textarea>`
            : `<input maxlength="200" data-sc-copy-field="${field.id}" value="${escapeHtml(copy[field.id])}" placeholder="Leave blank to keep the built-in translation." />`}
        </label>`).join("");
    };
    const renderOrderingCopyFields = () => {
      const language = languageSelect.value;
      const copy = data.ordering.translations[language];
      orderingCopyContainer.innerHTML = [
        { id: "eyebrow", label: "Section label" },
        { id: "title", label: "Section title" },
      ].map((field) => `
        <label>${field.label}
          <input maxlength="200" data-sc-ordering-copy-field="${field.id}" value="${escapeHtml(copy[field.id])}" placeholder="Leave blank to keep the built-in translation." />
        </label>`).join("");
    };
    const moveButtons = (type, index, length) => `
      <div class="support-content-card-actions">
        <button class="admin-secondary-button" type="button" data-sc-action="up" data-sc-type="${type}" data-sc-index="${index}" ${index === 0 ? "disabled" : ""} aria-label="Move up"><i data-lucide="arrow-up" aria-hidden="true"></i></button>
        <button class="admin-secondary-button" type="button" data-sc-action="down" data-sc-type="${type}" data-sc-index="${index}" ${index === length - 1 ? "disabled" : ""} aria-label="Move down"><i data-lucide="arrow-down" aria-hidden="true"></i></button>
        <button class="admin-danger-button" type="button" data-sc-action="delete" data-sc-type="${type}" data-sc-index="${index}"><i data-lucide="trash-2" aria-hidden="true"></i> Delete</button>
      </div>`;
    const renderSections = () => {
      const language = languageSelect.value;
      sectionsContainer.innerHTML = data.sections.length
        ? data.sections.map((section, index) => {
          const translations = section.translations[language] || {};
          const title = translations.title || "";
          const body = translations.body || "";
          const iconOptions = schema.icons.map((icon) => `<option value="${icon}" ${section.icon === icon ? "selected" : ""}>${icon}</option>`).join("");
          return `
            <fieldset class="support-content-card">
              <legend>${escapeHtml(section.label || "Custom section")}</legend>
              <div class="support-content-card-heading">${moveButtons("section", index, data.sections.length)}</div>
              ${section.custom ? `
                <div class="admin-form-grid">
                  <label>Display type<select data-sc-section-index="${index}" data-sc-field="kind"><option value="policy" ${section.kind === "policy" ? "selected" : ""}>Policy</option><option value="legal" ${section.kind === "legal" ? "selected" : ""}>Legal</option></select></label>
                  <label>Icon<select data-sc-section-index="${index}" data-sc-field="icon">${iconOptions}</select></label>
                </div>` : ""}
              <div class="admin-form-grid">
                <label>Title<input maxlength="200" data-sc-section-index="${index}" data-sc-field="title" value="${escapeHtml(title)}" placeholder="Leave blank to keep the built-in translation." /></label>
                <label class="form-field-wide">Full text<textarea rows="5" maxlength="6000" data-sc-section-index="${index}" data-sc-field="body" placeholder="Leave blank to keep the built-in translation.">${escapeHtml(body)}</textarea></label>
              </div>
            </fieldset>`;
        }).join("")
        : '<p class="support-content-empty">No policy sections. Add a section to publish support information.</p>';
    };
    const renderFaqs = () => {
      const language = languageSelect.value;
      faqsContainer.innerHTML = data.faqs.length
        ? data.faqs.map((faq, index) => {
          const translations = faq.translations[language] || {};
          return `
            <fieldset class="support-content-card">
              <legend>${escapeHtml(faq.label || "Custom question")}</legend>
              <div class="support-content-card-heading">${moveButtons("faq", index, data.faqs.length)}</div>
              <div class="admin-form-grid">
                <label>Question<input maxlength="300" data-sc-faq-index="${index}" data-sc-field="question" value="${escapeHtml(translations.question || "")}" placeholder="Leave blank to keep the built-in translation." /></label>
                <label class="form-field-wide">Answer<textarea rows="4" maxlength="3000" data-sc-faq-index="${index}" data-sc-field="answer" placeholder="Leave blank to keep the built-in translation.">${escapeHtml(translations.answer || "")}</textarea></label>
              </div>
            </fieldset>`;
        }).join("")
        : '<p class="support-content-empty">No questions. Add a question to publish FAQs.</p>';
    };
    const renderOrderingSteps = () => {
      const language = languageSelect.value;
      orderingStepsContainer.innerHTML = data.ordering.steps.length
        ? data.ordering.steps.map((step, index) => {
          const translations = step.translations[language] || {};
          const iconOptions = schema.icons.map((icon) => `<option value="${icon}" ${step.icon === icon ? "selected" : ""}>${icon}</option>`).join("");
          return `
            <fieldset class="support-content-card">
              <legend>${escapeHtml(step.label || `Step ${index + 1}`)}</legend>
              <div class="support-content-card-heading">${moveButtons("orderingStep", index, data.ordering.steps.length)}</div>
              <div class="admin-form-grid">
                <label>Icon<select data-sc-ordering-step-index="${index}" data-sc-field="icon">${iconOptions}</select></label>
                <label>Title<input maxlength="200" data-sc-ordering-step-index="${index}" data-sc-field="title" value="${escapeHtml(translations.title || "")}" placeholder="Leave blank to keep the built-in translation." /></label>
                <label class="form-field-wide">Description<textarea rows="3" maxlength="2000" data-sc-ordering-step-index="${index}" data-sc-field="body" placeholder="Leave blank to keep the built-in translation.">${escapeHtml(translations.body || "")}</textarea></label>
              </div>
            </fieldset>`;
        }).join("")
        : '<p class="support-content-empty">No ordering steps. Add a step to explain how customers place an order.</p>';
    };
    const render = () => {
      renderCopyFields();
      renderOrderingCopyFields();
      renderOrderingSteps();
      renderSections();
      renderFaqs();
      window.lucide?.createIcons();
    };
    const setLoaded = (value) => {
      loaded = value;
      saveButton.disabled = !loaded || busy;
      translateButton.disabled = !loaded || busy;
    };
    const setBusy = (value) => {
      busy = value;
      form.querySelectorAll("input, textarea, select, button").forEach((control) => {
        if (value) {
          control.dataset.scTranslationWasDisabled = String(control.disabled);
          control.disabled = true;
        } else if (control.dataset.scTranslationWasDisabled !== undefined) {
          control.disabled = control.dataset.scTranslationWasDisabled === "true";
          delete control.dataset.scTranslationWasDisabled;
        }
      });
      setLoaded(loaded);
    };
    const splitTranslationText = (value, limit) => {
      const chunks = [];
      let remaining = value.trim();
      while (remaining.length > limit) {
        let splitAt = Math.max(remaining.lastIndexOf(" ", limit), remaining.lastIndexOf("\n", limit));
        if (splitAt < limit * 0.6) splitAt = limit;
        if (splitAt > 0) {
          const previous = remaining.charCodeAt(splitAt - 1);
          const current = remaining.charCodeAt(splitAt);
          if (previous >= 0xd800 && previous <= 0xdbff && current >= 0xdc00 && current <= 0xdfff) splitAt -= 1;
        }
        chunks.push(remaining.slice(0, splitAt).trim());
        remaining = remaining.slice(splitAt).trim();
      }
      if (remaining) chunks.push(remaining);
      return chunks;
    };
    const translationErrorMessage = async (error) => {
      let message = error?.message || "Translation failed.";
      if (error?.context instanceof Response) {
        try {
          const body = await error.context.json();
          if (typeof body.error === "string" && body.error.trim()) message = body.error;
        } catch (parseError) {
          console.warn("Could not read the support translation error response.", parseError);
        }
      }
      return message;
    };
    const invokeTranslation = async (body) => {
      let waitedForRateLimit = false;
      while (true) {
        try {
          const { data: result, error } = await client.functions.invoke("translate-high-refresh", { body });
          if (error) throw error;
          if (!result?.translations) throw new Error("Translation service returned an empty response.");
          return result.translations;
        } catch (error) {
          const message = await translationErrorMessage(error);
          if (!waitedForRateLimit && message.includes("Please wait a minute before translating again.")) {
            waitedForRateLimit = true;
            setFeedback("Translation limit reached. Retrying in one minute…");
            await new Promise((resolve) => window.setTimeout(resolve, 60_000));
            continue;
          }
          throw new Error(message);
        }
      }
    };
    const makeTranslationField = ({ label, sourceField, sourceText, maxTargetLength, readTarget, writeTarget }) => {
      const source = String(sourceText || "").trim();
      const targetLocales = schema.languages.filter((locale) => locale !== "en");
      const targetLanguages = targetLocales.filter((locale) => !String(readTarget(locale) || "").trim());
      if (!source || !targetLanguages.length) return null;
      const limits = { eyebrow: 200, title: 600, text: 4000, badge: 200 };
      return {
        label,
        sourceField,
        chunks: splitTranslationText(source, limits[sourceField]),
        maxTargetLength,
        targetLocales,
        targetLanguages,
        readTarget,
        writeTarget,
        parts: Object.fromEntries(targetLanguages.map((locale) => [locale, []])),
        failed: false,
        failure: "",
      };
    };
    const collectTranslationUnits = () => {
      const units = [];
      const copyFields = [
        { id: "helpTitle", sourceField: "title" },
        { id: "intro", sourceField: "text" },
        { id: "policiesLabel", sourceField: "badge" },
        { id: "faqTitle", sourceField: "eyebrow" },
      ].map(({ id, sourceField }) => makeTranslationField({
        label: id,
        sourceField,
        sourceText: data.translations.en[id],
        maxTargetLength: id === "intro" ? 1200 : 200,
        readTarget: (locale) => data.translations[locale][id],
        writeTarget: (locale, value) => { data.translations[locale][id] = value; },
      })).filter(Boolean);
      if (copyFields.length) units.push({ label: "Page headings and introduction", fields: copyFields });

      const orderingCopyFields = [
        { id: "eyebrow", sourceField: "eyebrow" },
        { id: "title", sourceField: "title" },
      ].map(({ id, sourceField }) => makeTranslationField({
        label: id,
        sourceField,
        sourceText: data.ordering.translations.en[id],
        maxTargetLength: 200,
        readTarget: (locale) => data.ordering.translations[locale][id],
        writeTarget: (locale, value) => { data.ordering.translations[locale][id] = value; },
      })).filter(Boolean);
      if (orderingCopyFields.length) units.push({ label: "How ordering works", fields: orderingCopyFields });

      for (const step of data.ordering.steps) {
        const fields = [
          makeTranslationField({
            label: "title",
            sourceField: "title",
            sourceText: step.translations.en.title,
            maxTargetLength: 200,
            readTarget: (locale) => step.translations[locale].title,
            writeTarget: (locale, value) => { step.translations[locale].title = value; },
          }),
          makeTranslationField({
            label: "description",
            sourceField: "text",
            sourceText: step.translations.en.body,
            maxTargetLength: 2000,
            readTarget: (locale) => step.translations[locale].body,
            writeTarget: (locale, value) => { step.translations[locale].body = value; },
          }),
        ].filter(Boolean);
        if (fields.length) units.push({ label: step.label || step.id, fields });
      }

      for (const section of data.sections) {
        const fields = [
          makeTranslationField({
            label: "title",
            sourceField: "title",
            sourceText: section.translations.en.title,
            maxTargetLength: 200,
            readTarget: (locale) => section.translations[locale].title,
            writeTarget: (locale, value) => { section.translations[locale].title = value; },
          }),
          makeTranslationField({
            label: "text",
            sourceField: "text",
            sourceText: section.translations.en.body,
            maxTargetLength: 6000,
            readTarget: (locale) => section.translations[locale].body,
            writeTarget: (locale, value) => { section.translations[locale].body = value; },
          }),
        ].filter(Boolean);
        if (fields.length) units.push({ label: section.label || section.id, fields });
      }
      for (const faq of data.faqs) {
        const fields = [
          makeTranslationField({
            label: "question",
            sourceField: "title",
            sourceText: faq.translations.en.question,
            maxTargetLength: 300,
            readTarget: (locale) => faq.translations[locale].question,
            writeTarget: (locale, value) => { faq.translations[locale].question = value; },
          }),
          makeTranslationField({
            label: "answer",
            sourceField: "text",
            sourceText: faq.translations.en.answer,
            maxTargetLength: 3000,
            readTarget: (locale) => faq.translations[locale].answer,
            writeTarget: (locale, value) => { faq.translations[locale].answer = value; },
          }),
        ].filter(Boolean);
        if (fields.length) units.push({ label: faq.label || faq.id, fields });
      }
      return units;
    };

    form.addEventListener("input", (event) => {
      if (busy) return;
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      if (target.dataset.scCopyField) {
        data.translations[languageSelect.value][target.dataset.scCopyField] = target.value;
        return;
      }
      if (target.dataset.scOrderingCopyField) {
        data.ordering.translations[languageSelect.value][target.dataset.scOrderingCopyField] = target.value;
        return;
      }
      if (target.dataset.scOrderingStepIndex !== undefined) {
        const step = data.ordering.steps[Number(target.dataset.scOrderingStepIndex)];
        if (step) step.translations[languageSelect.value][target.dataset.scField] = target.value;
        return;
      }
      if (target.dataset.scSectionIndex !== undefined) {
        const section = data.sections[Number(target.dataset.scSectionIndex)];
        if (section) section.translations[languageSelect.value][target.dataset.scField] = target.value;
        return;
      }
      if (target.dataset.scFaqIndex !== undefined) {
        const faq = data.faqs[Number(target.dataset.scFaqIndex)];
        if (faq) faq.translations[languageSelect.value][target.dataset.scField] = target.value;
      }
    });
    form.addEventListener("change", (event) => {
      if (busy) return;
      const target = event.target;
      if (target === languageSelect) {
        render();
        return;
      }
      if (!(target instanceof HTMLSelectElement)) return;
      if (target.dataset.scOrderingStepIndex !== undefined) {
        const step = data.ordering.steps[Number(target.dataset.scOrderingStepIndex)];
        if (step && target.dataset.scField === "icon" && schema.icons.includes(target.value)) step.icon = target.value;
        return;
      }
      if (target.dataset.scSectionIndex === undefined) return;
      const section = data.sections[Number(target.dataset.scSectionIndex)];
      if (!section) return;
      if (target.dataset.scField === "kind") section.kind = target.value === "legal" ? "legal" : "policy";
      if (target.dataset.scField === "icon" && schema.icons.includes(target.value)) section.icon = target.value;
    });
    form.addEventListener("click", (event) => {
      if (busy) return;
      const button = event.target.closest("[data-sc-action]");
      if (!button) return;
      const type = button.dataset.scType;
      const list = type === "section" ? data.sections : type === "faq" ? data.faqs : data.ordering.steps;
      const index = Number(button.dataset.scIndex);
      if (!Number.isInteger(index) || !list[index]) return;
      if (button.dataset.scAction === "delete") {
        list.splice(index, 1);
      } else {
        const targetIndex = index + (button.dataset.scAction === "up" ? -1 : 1);
        if (targetIndex < 0 || targetIndex >= list.length) return;
        [list[index], list[targetIndex]] = [list[targetIndex], list[index]];
      }
      setFeedback("");
      render();
    });
    form.querySelector("#add-support-section").addEventListener("click", () => {
      if (busy) return;
      if (data.sections.length >= 40) {
        setFeedback("A maximum of 40 sections can be managed at once.", true);
        return;
      }
      const id = `custom-policy-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      data.sections.push({
        id,
        kind: "policy",
        icon: "circle-help",
        label: "Custom section",
        custom: true,
        translations: emptyTranslations(),
      });
      render();
    });
    form.querySelector("#add-support-faq").addEventListener("click", () => {
      if (busy) return;
      if (data.faqs.length >= 60) {
        setFeedback("A maximum of 60 questions can be managed at once.", true);
        return;
      }
      const id = `custom-faq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      data.faqs.push({ id, label: "Custom question", custom: true, translations: emptyTranslations() });
      render();
    });
    form.querySelector("#add-support-ordering-step").addEventListener("click", () => {
      if (busy) return;
      if (data.ordering.steps.length >= 12) {
        setFeedback("A maximum of 12 ordering steps can be managed at once.", true);
        return;
      }
      const id = `custom-step-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      data.ordering.steps.push({
        id,
        icon: "circle-help",
        label: "Custom step",
        custom: true,
        translations: emptyTranslations(),
      });
      setFeedback("");
      render();
    });
    translateButton.addEventListener("click", async () => {
      if (!loaded || busy) return;
      const englishValues = [
        ...schema.copyFields.map((field) => data.translations.en[field.id]),
        ...["eyebrow", "title"].map((field) => data.ordering.translations.en[field]),
        ...data.ordering.steps.flatMap((step) => [step.translations.en.title, step.translations.en.body]),
        ...data.sections.flatMap((section) => [section.translations.en.title, section.translations.en.body]),
        ...data.faqs.flatMap((faq) => [faq.translations.en.question, faq.translations.en.answer]),
      ];
      if (!englishValues.some((value) => String(value || "").trim())) {
        setFeedback("Enter English content before generating translations.", true);
        return;
      }

      const units = collectTranslationUnits();
      if (!units.length) {
        setFeedback("All available English content already has translations in the other languages.");
        return;
      }
      const totalCalls = units.reduce((sum, unit) => sum + Math.max(...unit.fields.map((field) => field.chunks.length)), 0);
      let completedCalls = 0;
      const failures = [];
      setBusy(true);
      try {
        for (const unit of units) {
          const chunkCount = Math.max(...unit.fields.map((field) => field.chunks.length));
          for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex += 1) {
            const activeFields = unit.fields.filter((field) => !field.failed && field.chunks[chunkIndex]);
            if (!activeFields.length) {
              completedCalls += 1;
              continue;
            }
            const source = { eyebrow: "", title: "", text: "", badge: "" };
            const saved = {};
            for (const field of activeFields) {
              source[field.sourceField] = field.chunks[chunkIndex];
              if (field.chunks.length !== 1) continue;
              for (const locale of field.targetLocales) {
                const existing = String(field.readTarget(locale) || "").trim();
                if (!existing) continue;
                if (field.sourceField === "text" && existing.length > 4000) continue;
                (saved[locale] ||= {})[field.sourceField] = existing;
              }
            }
            completedCalls += 1;
            setFeedback(`Translating ${completedCalls} of ${totalCalls}: ${unit.label}…`);
            let translations;
            try {
              translations = await invokeTranslation({ source, translations: saved });
            } catch (error) {
              const message = error?.message || "Translation failed.";
              activeFields.forEach((field) => {
                field.failed = true;
                field.failure = message;
              });
              continue;
            }

            for (const field of activeFields) {
              if (field.failed) continue;
              for (const locale of field.targetLanguages) {
                const translated = translations[locale]?.[field.sourceField];
                if (typeof translated !== "string" || !translated.trim()) {
                  field.failed = true;
                  field.failure = `No ${locale} translation was returned.`;
                  break;
                }
                if (!String(field.readTarget(locale) || "").trim()) field.parts[locale].push(translated.trim());
              }
            }
          }
        }

        let translatedFields = 0;
        for (const unit of units) {
          for (const field of unit.fields) {
            if (!field.failed) {
              for (const locale of field.targetLanguages) {
                if (field.parts[locale].length !== field.chunks.length) {
                  field.failed = true;
                  field.failure = "The translation was incomplete.";
                  break;
                }
              }
            }
            if (field.failed) {
              failures.push(`${unit.label} (${field.label}): ${field.failure}`);
              continue;
            }
            const generated = Object.fromEntries(field.targetLanguages.map((locale) => [
              locale,
              field.parts[locale].join(" "),
            ]));
            const oversizedLocale = field.targetLanguages.find((locale) => generated[locale].length > field.maxTargetLength);
            if (oversizedLocale) {
              failures.push(`${unit.label} (${field.label}): the ${oversizedLocale} translation exceeds the field limit; shorten it manually.`);
              continue;
            }
            for (const locale of field.targetLanguages) {
              if (!String(field.readTarget(locale) || "").trim()) {
                field.writeTarget(locale, generated[locale]);
              }
            }
            translatedFields += 1;
          }
        }
        setFeedback(failures.length
          ? `Translated ${translatedFields} field(s). Some translations failed: ${failures.join(" · ")}. Review successful results and retry or edit manually.`
          : `Translated ${translatedFields} field(s) into the missing languages. Review them, then save support content.`);
      } catch (error) {
        setFeedback(`Could not complete support translations. ${error?.message || "Please try again."}`, true);
      } finally {
        render();
        setBusy(false);
      }
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!loaded || busy) return;
      for (const section of data.sections.filter((item) => item.custom)) {
        if (!schema.languages.some((locale) =>
          String(section.translations[locale].title || "").trim()
          && String(section.translations[locale].body || "").trim())) {
          setFeedback("Add a title and full text in at least one language for every custom section.", true);
          return;
        }
      }
      for (const faq of data.faqs.filter((item) => item.custom)) {
        if (!schema.languages.some((locale) =>
          String(faq.translations[locale].question || "").trim()
          && String(faq.translations[locale].answer || "").trim())) {
          setFeedback("Add a question and answer in at least one language for every custom FAQ.", true);
          return;
        }
      }
      for (const step of data.ordering.steps.filter((item) => item.custom)) {
        if (!schema.languages.some((locale) =>
          String(step.translations[locale].title || "").trim()
          && String(step.translations[locale].body || "").trim())) {
          setFeedback("Add a title and description in at least one language for every custom ordering step.", true);
          return;
        }
      }
      setBusy(true);
      setFeedback("Saving support content…");
      try {
        const payload = normalize(data);
        const { error } = await client
          .from("homepage_sections")
          .upsert({ key: SECTION_KEY, data: payload }, { onConflict: "key" });
        if (error) throw error;
        data = payload;
        window.RUQO_SUPPORT_CONTENT = payload;
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
        } catch (error) {
          console.warn("Could not cache support content in this browser.", error);
        }
        window.dispatchEvent(new CustomEvent("ruqo:home-support-updated", { detail: payload }));
        setFeedback("Support content saved.");
        render();
      } catch (error) {
        setFeedback(`Could not save support content. ${error?.message || "Please try again."}`, true);
      } finally {
        render();
        setBusy(false);
      }
    });

    form.dataset.initialized = "true";
    form._supportContentReady = (async () => {
      setLoaded(false);
      setFeedback("Loading support content…");
      try {
        const { data: row, error } = await client
          .from("homepage_sections")
          .select("data")
          .eq("key", SECTION_KEY)
          .maybeSingle();
        if (error) throw error;
        data = normalize(row?.data);
        setLoaded(true);
        setFeedback("");
        render();
      } catch (error) {
        setFeedback(`Could not load support content. Refresh the page before editing. ${error?.message || ""}`, true);
      }
    })();
    return form._supportContentReady;
  };
})();
