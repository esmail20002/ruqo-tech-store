(() => {
  const fields = ["eyebrow", "title", "text"];
  const languages = ["ar", "fr", "es", "zh"];
  const defaults = {
    eyebrow: "Future technology",
    title: "Latest devices. A refined shopping experience.",
    text: "Discover high-performance smart devices, advanced security, and premium design built for modern life. From phones to laptops and home tech, every product is selected to match your ambitions.",
  };
  window.RUQO_INIT_HOME_COPY_EDITOR = (client) => {
    const dialog = document.querySelector("#home-copy-dialog");
    const form = document.querySelector("#home-copy-form");
    const languageSelect = document.querySelector("#home-copy-language");
    const feedback = document.querySelector("#home-copy-feedback");
    const status = document.querySelector("#home-copy-status");
    const buttons = {
      save: document.querySelector("#save-home-copy"),
      translate: document.querySelector("#translate-home-copy"),
      publish: document.querySelector("#publish-home-copy"),
    };
    let revision = 0;
    let source = { ...defaults };
    let translations = {};
    let persistedSource = { ...source };
    let language = "en";
    let dirty = false;
    let busy = false;
    let loaded = false;
    let publishedRevision = null;
    let opener;
    const copyFor = () => language === "en" ? source : (translations[language] ||= {});
    const complete = () => languages.every((lang) => fields.every((field) =>
      typeof translations[lang]?.[field] === "string" &&
      (!source[field].trim() || Boolean(translations[lang][field].trim())) &&
      (Boolean(source[field].trim()) === Boolean(translations[lang][field].trim()))));
    const message = (text, success = false) => {
      feedback.textContent = text;
      feedback.hidden = !text;
      feedback.classList.toggle("is-success", success);
    };
    function update() {
      buttons.save.disabled = busy || !loaded;
      buttons.translate.disabled = busy || !loaded || dirty || !revision || complete();
      buttons.publish.disabled = busy || !loaded || dirty || !complete() || !revision || publishedRevision === revision;
      languageSelect.disabled = busy || !loaded;
      const current = copyFor();
      fields.forEach((field) => {
        form.elements[field].disabled = busy || !loaded ||
          (language !== "en" && !source[field].trim());
        const preview = dialog.querySelector(`[data-home-copy-preview="${field}"]`);
        preview.textContent = current[field] || "";
        preview.hidden = !preview.textContent.trim();
      });
      status.textContent = busy ? "Working… Keep this editor open."
        : !loaded ? "Draft is unavailable. Reopen the editor to retry."
        : dirty ? "Unsaved changes. Save this language before switching or generating translations."
        : revision === 0 ? "Built-in English content. Save a draft to start; the live site is unchanged."
        : publishedRevision === revision ? `Revision ${revision} is published.`
        : complete() ? `Draft revision ${revision}: ready to review and publish.`
        : `Draft revision ${revision}: translations are missing or need updating.`;
      dialog.querySelectorAll("[data-home-copy-close]").forEach((button) => { button.disabled = busy; });
      form.setAttribute("aria-busy", String(busy));
    }
    function render() {
      const current = copyFor();
      fields.forEach((field) => { form.elements[field].value = current[field] || ""; });
      const direction = language === "ar" ? "rtl" : "ltr";
      document.querySelector("#home-copy-fields").dir = direction;
      const preview = document.querySelector("#home-copy-preview");
      preview.dir = direction;
      preview.lang = language === "zh" ? "zh-CN" : language;
      update();
    }
    function acceptDraft(draft) {
      revision = draft.revision;
      source = { ...draft.source };
      persistedSource = { ...source };
      translations = structuredClone(draft.translations);
      dirty = false;
    }
    async function perform(action) {
      busy = true;
      message("");
      update();
      try {
        await action();
      } catch (error) {
        console.error("Homepage text operation failed:", error.message);
        message(error.message || "The operation failed. Your published content has not been changed.");
      } finally {
        busy = false;
        render();
      }
    }
    document.querySelector("#edit-home-copy").addEventListener("click", () => {
      opener = document.activeElement;
      language = "en";
      languageSelect.value = language;
      loaded = false;
      dialog.showModal();
      perform(async () => {
        const [draftResult, publishedResult] = await Promise.all([
          client.from("home_copy_drafts").select("*").eq("id", "homepage").maybeSingle(),
          client.from("home_copy_publications").select("*").eq("id", "homepage").maybeSingle(),
        ]);
        if (draftResult.error || publishedResult.error) {
          throw new Error("Could not load homepage text. Ensure the translation database migration is deployed, then reopen this editor.");
        }
        publishedRevision = publishedResult.data?.revision ?? null;
        if (draftResult.data) acceptDraft(draftResult.data);
        else {
          revision = 0;
          source = { ...(publishedResult.data?.translations?.en || defaults) };
          persistedSource = { ...source };
          translations = structuredClone(publishedResult.data?.translations || {});
          delete translations.en;
          dirty = false;
        }
        loaded = true;
      });
    });
    form.addEventListener("submit", (event) => event.preventDefault());
    form.addEventListener("input", (event) => {
      if (!fields.includes(event.target.name)) return;
      const current = copyFor();
      current[event.target.name] = event.target.value;
      dirty = true;
      update();
    });
    languageSelect.addEventListener("change", () => {
      if (dirty) {
        languageSelect.value = language;
        message("Save the current language first. This prevents losing manual translation edits.");
        return;
      }
      language = languageSelect.value;
      message("");
      render();
    });
    buttons.save.addEventListener("click", () => {
      if (!source.title.trim()) {
        message("The English main title is required.");
        return;
      }
      if (language !== "en" && !complete()) {
        message("Generate the missing translations before saving manual corrections.");
        return;
      }
      perform(async () => {
        // A source edit invalidates only the affected fields on the server.
        const sourceChanged = fields.some((field) => source[field] !== persistedSource[field]);
        const { data, error } = await client.rpc("save_home_copy_draft", {
          p_expected_revision: revision,
          p_source: source,
          p_translations: language !== "en" && !sourceChanged ? translations : null,
        });
        if (error) throw new Error(error.message);
        acceptDraft(data);
        message("Draft saved. The live homepage has not changed.", true);
      });
    });
    buttons.translate.addEventListener("click", () => perform(async () => {
      const { data, error } = await client.functions.invoke("translate-home-copy", { body: { revision } });
      if (error) {
        let detail = "Translation failed. Your draft is saved and published content is unchanged.";
        if (error.context instanceof Response) {
          try {
            const body = await error.context.json();
            if (typeof body.error === "string") detail = body.error;
          } catch (parseError) {
            console.warn("Could not read the translation service error response:", parseError.message);
          }
        }
        throw new Error(detail);
      }
      if (!data?.draft) throw new Error("Translation returned an invalid response. Reopen the editor to check the draft.");
      acceptDraft(data.draft);
      message("Translations saved. Choose each language to review or correct it before publishing.", true);
    }));
    buttons.publish.addEventListener("click", () => perform(async () => {
      const { data, error } = await client.rpc("publish_home_copy", { p_expected_revision: revision });
      if (error) throw new Error(error.message);
      publishedRevision = data.revision;
      message("Published successfully. Visitors receive the new copy when they load or refresh the homepage.", true);
    }));
    function close() {
      if (busy) return;
      if (dirty && !window.confirm("Discard unsaved homepage text changes? Saved drafts will be kept.")) return;
      dialog.close();
    }
    dialog.querySelectorAll("[data-home-copy-close]").forEach((button) => button.addEventListener("click", close));
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); close(); });
    dialog.addEventListener("close", () => opener?.focus());
  };
})();
