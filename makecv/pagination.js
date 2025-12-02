"use strict";

const data = require("./data.json");

class Page {
  constructor() {
    this.maxHeight = 940;
    this.height = 100; // padding top and bottom = 50px
    this.sections = [];
  }

  addHeight(height) {
    this.height += height;
  }

  updateSections(section) {
    for (let i = 0; i < this.sections.length; i++) {
      const _data = this.sections[i];
      if (_data.title === section.title) {
        this.sections[i] = section;
        return;
      }
    }
    this.sections.push(section);
  }

  isMaxIfAdd(height) {
    return this.height + height >= this.maxHeight;
  }
}

class BaseProcessor {
  constructor() {
    this.section = null;
    this.newPageHandler = null;
    this.page = null;
  }

  setSection(section) {
    this.section = { ...section };
  }

  setNewPageHandler(handler) {
    this.newPageHandler = handler;
  }

  initNewPage() {
    if (typeof this.newPageHandler === "function") {
      this.newPageHandler();
    }
  }

  setPage(page) {
    this.page = page;
  }

  estWhole() { }
}

class PersonalProcessor extends BaseProcessor {
  estWhole() {
    if (this.page.isMaxIfAdd(131)) {

    }
    this.page.addHeight(131);
    this.page.updateSections(this.section);
  }
}

class ProfileProcessor extends BaseProcessor {
  estWhole() {
  }
}

class Pagination {
  /**
   *
   */
  constructor(data) {
    this.data = data;
    this.pages = [];
    this.index = 0;
    this.maxPageHeight = 940;
    this.processorMap = {
      "PERSONAL": PersonalProcessor,
      "PROFILE": ProfileProcessor,
      "SKILLS": BaseProcessor,
      "EXPERIENCE": BaseProcessor,
      "ACHIEVEMENTS": BaseProcessor,
      "EDUCATION": BaseProcessor,
      "CERTIFICATIONS": BaseProcessor,
      "PROJECTS": BaseProcessor,
    };

    this.addNewPage();
  }

  /**
   * 
   * @param {Array} data 
   */
  run() {
    for (const section of this.data) {
      this.applyProcessor(section);
    }
  }

  addNewPage() {
    this.pages.push(new Page());
    this.index = this.pages.length - 1;
  }

  getCurrentPage() {
    return this.pages[this.index];
  }

  applyProcessor(section) {
    const processorClassName = this.processorMap[section.type];
    try {
      const processor = new processorClassName();
      const newPageHandler = () => {
        this.addNewPage();
        processor.setPage(this.getCurrentPage());
      };
      processor.setNewPageHandler(newPageHandler);
      processor.setSection(section);
      processor.setPage(this.getCurrentPage());

      if (Array.isArray(section.data)) {
        this.processArrayOfSection(processor);
      } else {
        this.processWholeSection(processor);
      }
    } catch (error) {
      console.log(error);
    }
  }

  processWholeSection(processor) {
    processor.estWhole();
  }

  processArrayOfSection(processor) {

  }

  printSummary() {
    console.log("Pages:", this.pages.length);
    console.log("Last page height:", this.getCurrentPage().height);
  }
}

(() => {
  const pagination = new Pagination(data);
  pagination.run();
  pagination.printSummary();
})();
