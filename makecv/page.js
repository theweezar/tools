"use strict";

function log(...args) {
  console.log("[Paginator]", ...args);
}

function calcHeight(element) {
  if (!element) return 0;
  const styles = window.getComputedStyle(element);
  const marginTop = parseFloat(styles.marginTop) || 0;
  const marginBottom = parseFloat(styles.marginBottom) || 0;
  return element.offsetHeight + marginTop + marginBottom;
}

class Page {
  constructor(config) {
    this.config = config;
    this.noBreakSelector = config.noBreakElementClass;
    this.dividerHeight = 26;
    this.reset();
  }

  reset() {
    this.pages = [];
    this.currentPage = null;
    this.currentHeight = 0;
    this.tempSection = null;
  }

  paginate(contentEl) {
    this.reset();
    this.startNewPage();

    const sections = Array.from(contentEl.children);
    for (const section of sections) {
      if (this.hasNoBreakItems(section)) {
        this.addNoBreakSection(section);
        continue;
      }
      this.addWholeSection(section);
    }

    this.pages.push(this.currentPage);
    return this.pages;
  }

  createPageElement() {
    const page = document.createElement("div");
    page.className = "page";
    page.style.width = `${this.config.maxWidth}px`;
    page.style.height = `${this.config.maxHeight}px`;
    page.style.padding = `${this.config.paddingTop}px ${this.config.paddingBottom}px`;
    return page;
  }

  createDivider() {
    const divider = document.createElement("div");
    divider.classList.add("divider");
    return divider;
  }

  startNewPage() {
    this.currentPage = this.createPageElement();
    this.currentHeight = 0;
  }

  exceedsUsable(height) {
    return height > this.config.usable;
  }

  hasNoBreakItems(section) {
    return Boolean(section.querySelector(this.noBreakSelector));
  }

  addWholeSection(section) {
    const sectionHeight = calcHeight(section);
    log(section, "section height:", sectionHeight);
    if (this.exceedsUsable(this.currentHeight + sectionHeight)) {
      this.pages.push(this.currentPage);
      this.startNewPage();
    }
    this.currentPage.appendChild(section.cloneNode(true));
    this.currentHeight += sectionHeight;
  }

  createTempSection(section) {
    const title = section.querySelector(".section-title");
    this.tempSection = section.cloneNode(false);
    if (title) this.tempSection.appendChild(title.cloneNode(true));
  }

  addNoBreakSection(section) {
    const items = Array.from(section.querySelectorAll(this.noBreakSelector));
    this.createTempSection(section);

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      this.addNoBreakItem(section, item, idx, items);
    }

    if (this.tempSection.children.length > 0) {
      this.currentPage.appendChild(this.tempSection);
    }
  }

  addNoBreakItem(section, item, idx, items) {
    const itemHeight = calcHeight(item);
    const divider = this.createDivider();
    const itemWithDivider = itemHeight + this.dividerHeight;

    if (this.exceedsUsable(this.currentHeight + itemWithDivider)) {
      if (this.tempSection.children.length > 0) {
        this.currentPage.appendChild(this.tempSection);
      }
      this.pages.push(this.currentPage);
      this.startNewPage();
      this.createTempSection(section);
    }

    this.tempSection.appendChild(item.cloneNode(true));
    this.tempSection.appendChild(divider);
    this.currentHeight += itemWithDivider;

    log(item, "item height:", itemWithDivider, "after adding, current height:", this.currentHeight);

    const nextItem = items[idx + 1];
    const isLastItem = idx === items.length - 1;
    const nextItemHeight = calcHeight(nextItem);
    const shouldRemoveDivider = this.exceedsUsable(
      this.currentHeight + nextItemHeight + this.dividerHeight
    ) || isLastItem;

    if (shouldRemoveDivider) {
      this.tempSection.removeChild(divider);
    }
  }
}

class Printer {
  constructor(config) {
    this.config = config;
    this.printBtn = null;
    this.borderBtn = null;
    this.showBorders = Boolean(config.enableBorderButton);
  }

  mount() {
    if (typeof document === "undefined") return;
    if (this.config.enablePrintButton) {
      this.printBtn = this.createPrintButton();
    }
    if (this.config.enableBorderButton) {
      this.borderBtn = this.createBorderButton();
      this.applyBorders(true);
    }
  }

  getPageElements() {
    return Array.from(document.querySelectorAll(".page"));
  }

  applyBorders(enabled) {
    const pages = this.getPageElements();
    const border = enabled ? this.config.borderStyle : "none";
    pages.forEach((page) => {
      page.style.border = border;
    });
    this.showBorders = enabled;
  }

  createBaseButton(className, text, styles) {
    const existing = document.querySelector(`.${className}`);
    if (existing) return existing;

    const button = document.createElement("button");
    button.className = className;
    button.type = "button";
    button.textContent = text;

    Object.assign(button.style, {
      position: "fixed",
      zIndex: "99999",
      padding: "10px 14px",
      background: "#0078d4",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      cursor: "pointer",
      fontSize: "14px",
      display: "block",
      ...styles
    });

    document.body.appendChild(button);
    return button;
  }

  createPrintButton() {
    const button = this.createBaseButton("paginator-print-btn", "Print", {
      right: "16px",
      bottom: "16px"
    });

    button.addEventListener("click", () => {
      this.handlePrint(button);
    });

    return button;
  }

  createBorderButton() {
    const button = this.createBaseButton("paginator-border-btn", "Hide Borders", {
      right: "16px",
      bottom: "64px",
      background: "#444"
    });

    button.addEventListener("click", () => {
      this.applyBorders(!this.showBorders);
      button.textContent = this.showBorders ? "Hide Borders" : "Show Borders";
    });

    return button;
  }

  handlePrint(triggerBtn) {
    const pages = this.getPageElements();
    triggerBtn.style.display = "none";
    if (this.borderBtn) this.borderBtn.style.display = "none";

    if (!pages.length) {
      window.print();
      this.restoreButtons(triggerBtn);
      return;
    }

    const prevBorders = pages.map((page) => page.style.border);
    pages.forEach((page) => {
      page.style.border = "none";
    });

    let fallbackTimer = null;
    const restore = () => {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      pages.forEach((page, idx) => {
        page.style.border = prevBorders[idx] || "";
      });
      window.removeEventListener("afterprint", restore);
      window.removeEventListener("keyup", escHandler);
      this.restoreButtons(triggerBtn);
    };

    const escHandler = (event) => {
      if (event.key === "Escape") restore();
    };

    window.addEventListener("afterprint", restore);
    window.addEventListener("keyup", escHandler);

    fallbackTimer = setTimeout(() => {
      restore();
    }, 3000);

    window.print();
  }

  restoreButtons(triggerBtn) {
    triggerBtn.style.display = "block";
    if (this.borderBtn) this.borderBtn.style.display = "block";
  }
}

class Paginator {
  constructor(config) {
    this.config = this.initCfg(config);
    this.page = new Page(this.config);
    this.printer = new Printer(this.config);
    log("config:", this.config);
  }

  initCfg(config) {
    const defaultCfg = {
      maxHeight: 1330,
      maxWidth: 940,
      paddingTop: 60,
      paddingBottom: 60,
      noBreakElementClass: ".no-break",
      enablePrintButton: true,
      enableBorderButton: true,
      borderStyle: "1px solid #ccc"
    };

    const mergedCfg = { ...defaultCfg, ...config };
    return {
      ...mergedCfg,
      usable: mergedCfg.maxHeight - mergedCfg.paddingTop - mergedCfg.paddingBottom - 20
    };
  }

  paginate(contentEl) {
    return this.page.paginate(contentEl);
  }

  render(contentWrapperClass) {
    const wrapper = document.querySelector(contentWrapperClass);
    if (!wrapper) {
      throw new Error(`Content wrapper with class "${contentWrapperClass}" not found.`);
    }

    const root = wrapper.parentElement;
    const pages = this.paginate(wrapper);
    log("Paginator: Created", pages.length, "pages.");

    root.removeChild(wrapper);
    root.style.display = "block";
    pages.forEach((page) => root.appendChild(page));
    this.printer.mount();
  }

  static run(config, contentWrapperClass) {
    const paginator = new Paginator(config);
    paginator.render(contentWrapperClass);
  }
}

(() => {
  document.addEventListener("DOMContentLoaded", () => {
    Paginator.run(
      {
        maxHeight: 1330,
        maxWidth: 940,
        paddingTop: 60,
        paddingBottom: 60,
        noBreakElementClass: ".no-break",
        enablePrintButton: true,
        enableBorderButton: true,
        borderStyle: "1px solid #ccc"
      },
      ".page"
    );
  });
})();
