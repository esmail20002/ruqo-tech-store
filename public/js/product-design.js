(() => {
  if (document.body.dataset.productDesign !== "premium") return;

  const imageStage = document.querySelector(".product-detail-image");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  if (imageStage && finePointer.matches && !motionPreference.matches) {
    let frame = 0;
    imageStage.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const bounds = imageStage.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        imageStage.classList.add("is-pointer-active");
        imageStage.style.setProperty("--product-light-x", `${(x * 100).toFixed(2)}%`);
        imageStage.style.setProperty("--product-light-y", `${(y * 100).toFixed(2)}%`);
        imageStage.style.setProperty("--product-tilt-x", `${((0.5 - y) * 4).toFixed(2)}deg`);
        imageStage.style.setProperty("--product-tilt-y", `${((x - 0.5) * 5).toFixed(2)}deg`);
      });
    });

    imageStage.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frame);
      imageStage.classList.remove("is-pointer-active");
      imageStage.style.setProperty("--product-light-x", "50%");
      imageStage.style.setProperty("--product-light-y", "45%");
      imageStage.style.setProperty("--product-tilt-x", "0deg");
      imageStage.style.setProperty("--product-tilt-y", "0deg");
    });
  }

  const progress = document.createElement("div");
  progress.className = "product-design-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);

  let progressFrame = 0;
  const updateReadingProgress = () => {
    cancelAnimationFrame(progressFrame);
    progressFrame = requestAnimationFrame(() => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const amount = scrollableHeight > 0
        ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
        : 0;
      progress.style.setProperty("--reading-progress", amount.toFixed(4));
    });
  };

  window.addEventListener("scroll", updateReadingProgress, { passive: true });
  window.addEventListener("resize", updateReadingProgress, { passive: true });
  updateReadingProgress();
})();
