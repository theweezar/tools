"use strict";

class Paginator {
  constructor(config) {
    this.initCfg(config);
    this.createPrintButton();
  }

  /**
   * Initialize configuration by merging user config with default config
   * @param {Object} config - User configuration object
   */
  initCfg(config) {
    const defaultCfg = {
      maxHeight: 1330,
      maxWidth: 940,
      paddingTop: 60,
      paddingBottom: 60,
      noBreakElementClass: ".no-break",
    };
    const mergedCfg = {
      ...defaultCfg,
      ...config
    };
    const usable = mergedCfg.maxHeight - mergedCfg.paddingTop - mergedCfg.paddingBottom;
    this.config = {
      ...mergedCfg,
      usable
    };
    console.log("Paginator: Configuration initialized", this.config);
  }

  /**
   * Create and append a floating "Print" button.
   * When clicked it temporarily removes the inline border style from ".page" elements,
   * triggers the print dialog, then restores the original inline border values.
   * @returns {HTMLButtonElement} The created print button
   */
  createPrintButton() {
    if (typeof document === "undefined") return null;
    const existing = document.querySelector(".paginator-print-btn");
    if (existing) return existing;

    const btn = document.createElement("button");
    btn.className = "paginator-print-btn";
    btn.type = "button";
    btn.textContent = "Print";
    btn.setAttribute("aria-label", "Print pages");

    Object.assign(btn.style, {
      position: "fixed",
      right: "16px",
      bottom: "16px",
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
    });

    btn.addEventListener("click", () => {
      btn.style.display = "none";
      const pages = Array.from(document.querySelectorAll(".page"));
      if (!pages.length) {
        window.print();
        btn.style.display = "block";
        return;
      }

      // Save current inline border values (may be empty string)
      const prevBorders = pages.map(p => p.style.border);
      // Remove borders by setting inline style
      pages.forEach(p => { p.style.border = "none"; });

      let fallbackTimer = null;
      const restore = () => {
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
        pages.forEach((p, i) => { p.style.border = prevBorders[i] || ""; });
        window.removeEventListener("afterprint", restore);
        window.removeEventListener("keyup", escHandler);
      };

      const escHandler = (e) => {
        if (e.key === "Escape") restore();
      };

      window.addEventListener("afterprint", restore);
      window.addEventListener("keyup", escHandler);

      // Fallback in case afterprint isn't fired reliably
      fallbackTimer = setTimeout(() => {
        restore();
      }, 3000);

      window.print();
      btn.style.display = "block";
    });

    document.body.appendChild(btn);
    return btn;
  }

  /**
   * Get configuration value by name
   * @param {string} name - Configuration property name
   * @returns {*} Configuration value or null if not found
   */
  getCfg(name) {
    return this.config[name] || null;
  }

  /**
   * Create a new page element with configured dimensions and padding
   * @returns {Element} Newly created page element
   */
  createPage() {
    const page = document.createElement("div");
    page.className = "page";
    page.style.width = `${this.getCfg("maxWidth")}px`;
    page.style.height = `${this.getCfg("maxHeight")}px`;
    page.style.padding = `${this.getCfg("paddingTop")}px ${this.getCfg("paddingBottom")}px`;
    page.style.border = "1px solid #ccc";
    return page;
  }

  /**
   * Create a divider element
   * @returns {Element} Newly created divider element
   */
  createDivider() {
    const div = document.createElement("div");
    div.classList.add("divider");
    return div;
  }

  /**
   * Paginate the content element into multiple pages
   * @param {Element} contentEl - Content element to paginate
   * @returns {Element[]} Array of page elements
   */
  paginate(contentEl) {
    const sections = Array.from(contentEl.children);
    const pages = [];

    let currentPage;
    let currentHeight;
    let tempSection;

    const noBreak = this.getCfg("noBreakElementClass");
    const exceedsUsable = (height) => {
      return height > this.getCfg("usable");
    };
    const addNewPage = () => {
      currentPage = this.createPage();
      currentHeight = 0;
    };

    /**
     * 
     * @param {Element} section 
     */
    const shallowCloneTempSection = (section) => {
      const title = section.querySelector(".section-title");
      tempSection = section.cloneNode(false);
      if (title) tempSection.appendChild(title.cloneNode(true));
    };

    addNewPage();

    for (const section of sections) {
      // CASE 1: Section does NOT contain .no-break => treat normally
      if (!section.querySelector(noBreak)) {
        const sectionHeight = section.offsetHeight;
        if (exceedsUsable(currentHeight + sectionHeight)) {
          pages.push(currentPage);
          addNewPage();
        }
        currentPage.appendChild(section.cloneNode(true));
        currentHeight += sectionHeight;
        continue;
      }

      // CASE 2: Section contains .no-break => process each item separately
      const items = Array.from(section.querySelectorAll(noBreak));
      shallowCloneTempSection(section);

      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const itemHeight = item.offsetHeight;

        if (exceedsUsable(currentHeight + itemHeight)) {
          // Push the current section if it has content
          if (tempSection.children.length > 0) {
            currentPage.appendChild(tempSection);
          }
          pages.push(currentPage);
          addNewPage();
          shallowCloneTempSection(section);
        }

        const divider = this.createDivider();
        tempSection.appendChild(item.cloneNode(true));
        tempSection.appendChild(divider);
        currentHeight += itemHeight + divider.offsetHeight;

        const nextItem = items[idx + 1];
        const nextItemHeight = nextItem ? nextItem.offsetHeight : 0;
        // Remove last divider, or when breaking new page
        if (
          exceedsUsable(currentHeight + nextItemHeight)
          || idx == items.length - 1
        ) {
          tempSection.removeChild(divider);
        }
      }

      // Append leftover section after finishing items
      if (tempSection.children.length > 0) {
        currentPage.appendChild(tempSection);
      }
    }

    pages.push(currentPage);
    return pages;
  }

  /**
   * 
   * @param {Object} config - Configuration object for pagination
   * @param {string} contentWrapperClass 
   * @returns 
   */
  static run(config, contentWrapperClass) {
    const wrapper = document.querySelector(contentWrapperClass);

    if (!wrapper) throw new Error(`Content wrapper with class "${contentWrapperClass}" not found.`);

    const root = wrapper.parentElement;
    const paginator = new Paginator(config);
    const pages = paginator.paginate(wrapper);
    console.log("Paginator: Created", pages.length, "pages.");

    root.removeChild(wrapper);
    root.style.display = "block";
    pages.forEach(page => root.appendChild(page));
  }
}

(() => {
  Paginator.run({
    maxHeight: 1330,
    maxWidth: 940,
    paddingTop: 60,
    paddingBottom: 60,
    noBreakElementClass: ".no-break",
  }, ".page");
})();