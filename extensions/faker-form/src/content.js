/**
 * Content script that injects faker library and handles form filling
 */

import { faker } from "@faker-js/faker";
import RandExp from "randexp";

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fillForms") {
    const forms = getVisibleForms();
    let totalFilled = 0;
    forms.forEach((form) => {
      totalFilled += fillForm(form);
    });
    sendResponse({
      status: "success",
      message: `Forms filled with faker data (${totalFilled} elements)`,
      elementsFilled: totalFilled
    });
  }
});

/**
 * Get all visible forms in the viewport
 * @returns {HTMLFormElement[]} Array of visible form elements
 */
function getVisibleForms() {
  const allForms = document.querySelectorAll("form");
  const visibleForms = [];

  allForms.forEach((form) => {
    const visible = form.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    if (isElementInViewport(form) && visible) {
      visibleForms.push(form);
    }
  });

  return visibleForms;
}

/**
 * Check if element is visible in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if element is in viewport
 */
function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0
  );
}

/**
 * Fill all form elements within a specific form with faker data
 * @param {HTMLFormElement} form - The form element to fill
 * @returns {number} Number of elements filled
 */
function fillForm(form) {
  const fakerInstance = faker;
  if (!fakerInstance) {
    console.error("Faker instance not available");
    return 0;
  }

  let filledCount = 0;

  // Generate a single password for all password inputs in this form
  const formPassword = generateMemorablePassword(faker);

  // Get form elements only within this specific form
  const inputs = form.querySelectorAll("input:not([type=\"hidden\"]):not([type=\"button\"]):not([type=\"submit\"]):not([type=\"reset\"]):not([type=\"file\"]):not([readonly]):not([type=\"token\"])");
  const textareas = form.querySelectorAll("textarea:not([readonly])");
  const selects = form.querySelectorAll("select:not([disabled])");
  const checkboxes = form.querySelectorAll("input[type=\"checkbox\"]:not([readonly])");
  const radios = form.querySelectorAll("input[type=\"radio\"]:not([readonly])");

  // Fill input[type="text"], input[type="email"], etc.
  inputs.forEach((input) => {
    if (input.offsetParent === null) return; // Skip hidden elements

    const type = input.type || "text";
    const name = input.name || "";
    const id = input.id || "";

    try {
      switch (type) {
        case "email":
          input.value = fakerInstance.internet.email();
          break;
        case "tel":
        case "phone":
          const phone = fakerInstance.phone.number({ style: "international" });
          input.value = phone.replace(/\+/g, "").replace(/\s+/g, "");
          break;
        case "number":
          input.value = fakerInstance.number.int({ min: 1, max: 1000 });
          break;
        case "date":
          input.value = fakerInstance.date.birthdate({ min: 18, max: 80, mode: "age" }).toISOString().split("T")[0];
          break;
        case "url":
        case "website":
          input.value = fakerInstance.internet.url();
          break;
        case "password":
          input.value = formPassword;
          input.type = "text";
          break;
        default: // text and others
          input.value = getFakeValueWithAttributes(name, id, fakerInstance, input);
      }

      // Trigger input event for frameworks that listen to changes
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      filledCount++;
    } catch (error) {
      console.error("Error filling input:", error);
    }
  });

  // Fill textareas
  textareas.forEach((textarea) => {
    if (textarea.offsetParent === null) return;

    try {
      textarea.value = fakerInstance.lorem.paragraph();
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.dispatchEvent(new Event("change", { bubbles: true }));
      filledCount++;
    } catch (error) {
      console.error("Error filling textarea:", error);
    }
  });

  // Fill selects with random option
  selects.forEach((select) => {
    if (select.offsetParent === null) return;

    try {
      const options = Array.from(select.options).filter(opt => opt.value && opt.value !== "");
      if (options.length > 0) {
        const randomOption = options[Math.floor(Math.random() * options.length)];
        select.value = randomOption.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        filledCount++;
      }
    } catch (error) {
      console.error("Error filling select:", error);
    }
  });

  // Fill checkboxes randomly
  checkboxes.forEach((checkbox) => {
    if (checkbox.offsetParent === null) return;

    try {
      checkbox.checked = Math.random() > 0.5;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      filledCount++;
    } catch (error) {
      console.error("Error filling checkbox:", error);
    }
  });

  // Fill radio buttons (select one from each group)
  const radioGroups = {};
  radios.forEach((radio) => {
    const groupName = radio.name;
    if (!radioGroups[groupName]) {
      radioGroups[groupName] = [];
    }
    radioGroups[groupName].push(radio);
  });

  Object.values(radioGroups).forEach((group) => {
    try {
      const randomRadio = group[Math.floor(Math.random() * group.length)];
      randomRadio.checked = true;
      randomRadio.dispatchEvent(new Event("change", { bubbles: true }));
      filledCount++;
    } catch (error) {
      console.error("Error filling radio:", error);
    }
  });

  console.log(`Faker Form: Filled ${filledCount} form elements in form`);
  return filledCount;
}

/**
 * Get fake data value based on field type detection and HTML attributes
 * @param {string} name - input name attribute
 * @param {string} id - input id attribute
 * @param {faker} faker - faker instance
 * @param {HTMLInputElement} element - input element (for reading attributes)
 * @returns {string}
 */
function getFakeValueWithAttributes(name, id, faker, element) {
  const nameAttr = (name + id).toLowerCase();
  const pattern = element?.getAttribute("pattern");
  const maxLength = element?.getAttribute("maxlength");
  const minLength = element?.getAttribute("minlength");

  let fakeValue = "";

  if (/first.?name|fname|given.?name/.test(nameAttr)) {
    fakeValue = faker.person.firstName();
  } else if (/last.?name|lname|family.?name|surname/.test(nameAttr)) {
    fakeValue = faker.person.lastName();
  } else if (/^name$|fullname|full.?name|username/.test(nameAttr)) {
    fakeValue = faker.person.fullName();
  } else if (/email|e.?mail|mail/.test(nameAttr)) {
    fakeValue = faker.internet.email();
  } else if (/phone|tel|telephone|mobile|cell/.test(nameAttr)) {
    fakeValue = faker.phone.number();
  } else if (/address|street|location|addr/.test(nameAttr)) {
    fakeValue = faker.location.streetAddress();
  } else if (/city|town/.test(nameAttr)) {
    fakeValue = faker.location.city();
  } else if (/state|province|region/.test(nameAttr)) {
    fakeValue = faker.location.state({ abbreviated: true });
  } else if (/zip|postal|pincode|postcode/.test(nameAttr)) {
    fakeValue = faker.location.zipCode();
  } else if (/country|nation/.test(nameAttr)) {
    fakeValue = faker.location.country();
  } else if (/company|organization|org|business/.test(nameAttr)) {
    fakeValue = faker.company.name();
  } else if (/website|url|homepage|web/.test(nameAttr)) {
    fakeValue = faker.internet.url();
  } else {
    // Default: generic word
    fakeValue = faker.lorem.word();
  }

  // Apply length constraints if pattern is not provided
  if (!pattern && (maxLength || minLength)) {
    fakeValue = constrainStringLength(fakeValue, maxLength, minLength, faker);
  }

  // If pattern exists, try to generate value matching the pattern
  if (pattern && !matchPattern(fakeValue, pattern)) {
    fakeValue = generateValueFromPattern(pattern, faker, maxLength, minLength);
  }

  return fakeValue;
}

/**
 * Match a value against a regex pattern
 * @param {string} value - The value to test
 * @param {string} pattern - The regex pattern string
 * @returns {boolean}
 */
function matchPattern(value, pattern) {
  try {
    const regex = new RegExp(pattern);
    return regex.test(value);
  } catch (error) {
    console.warn(`Invalid pattern: ${pattern}`, error);
    return false;
  }
}

/**
 * Constrain a string to respect maxlength and minlength attributes
 * @param {string} value - The value to constrain
 * @param {string|number} maxLength - Maximum length (HTML attribute)
 * @param {string|number} minLength - Minimum length (HTML attribute)
 * @param {faker} faker - faker instance
 * @returns {string}
 */
function constrainStringLength(value, maxLength, minLength, faker) {
  const max = maxLength ? parseInt(maxLength, 10) : null;
  const min = minLength ? parseInt(minLength, 10) : null;

  // If value is already within bounds, return as is
  if ((max === null || value.length <= max) && (min === null || value.length >= min)) {
    return value;
  }

  // If value is too long, truncate
  if (max !== null && value.length > max) {
    return value.substring(0, max);
  }

  // If value is too short, pad with random characters
  if (min !== null && value.length < min) {
    let padded = value;
    const padLength = min - value.length;
    const padding = faker.string.alphanumeric(padLength);
    padded = value + padding;
    return padded.substring(0, max || padded.length);
  }

  return value;
}

/**
 * Generate a value that matches the given regex pattern
 * @param {string} pattern - Regex pattern string
 * @param {faker} faker - faker instance
 * @param {string|number} maxLength - Maximum length constraint
 * @param {string|number} minLength - Minimum length constraint
 * @returns {string}
 */
function generateValueFromPattern(pattern, faker, maxLength, minLength) {
  const max = maxLength ? parseInt(maxLength, 10) : null;
  const min = minLength ? parseInt(minLength, 10) : null;

  try {
    // Try to compile the regex
    const regex = new RegExp(pattern);
    const gen = new RandExp(regex).gen();
    const subIdx = min || max || null;
    if (subIdx !== null) return gen.substring(0, subIdx);
    return gen;
  } catch (error) {
    console.warn(`Invalid pattern: ${pattern}`, error);
    const length = min || max || 8;
    return faker.string.alphanumeric(length);
  }
}

/**
 * Generate a memorable password that is simple and easy to remember
 * @param {faker} faker - faker instance
 * @returns {string}
 */
function generateMemorablePassword(faker) {
  const words = [
    "Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel",
    "India", "Juliet", "Kilo", "Lima", "Mike", "November", "Oscar", "Papa",
    "Quebec", "Romeo", "Sierra", "Tango", "Uniform", "Victor", "Whiskey",
    "Xray", "Yankee", "Zulu"
  ];

  const word = words[Math.floor(Math.random() * words.length)];
  const number = faker.number.int({ min: 100, max: 999 });

  return `${word}@${number}`;
}
