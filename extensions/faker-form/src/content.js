/**
 * Content script that injects faker library and handles form filling
 */

import { faker } from '@faker-js/faker';

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForms') {
    const forms = getVisibleForms();
    let totalFilled = 0;
    forms.forEach((form) => {
      totalFilled += fillForm(form);
    });
    sendResponse({
      status: 'success',
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
  const allForms = document.querySelectorAll('form');
  const visibleForms = [];

  allForms.forEach((form) => {
    if (isElementInViewport(form)) {
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
    console.error('Faker instance not available');
    return 0;
  }

  let filledCount = 0;

  // Get form elements only within this specific form
  const inputs = form.querySelectorAll('input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="file"]):not([readonly]):not([type="token"])');
  const textareas = form.querySelectorAll('textarea:not([readonly])');
  const selects = form.querySelectorAll('select:not([disabled])');
  const checkboxes = form.querySelectorAll('input[type="checkbox"]:not([readonly])');
  const radios = form.querySelectorAll('input[type="radio"]:not([readonly])');

  // Fill input[type="text"], input[type="email"], etc.
  inputs.forEach((input) => {
    if (input.offsetParent === null) return; // Skip hidden elements

    const type = input.type || 'text';
    const name = input.name || '';
    const id = input.id || '';

    try {
      switch (type) {
        case 'email':
          input.value = fakerInstance.internet.email();
          break;
        case 'tel':
        case 'phone':
          input.value = fakerInstance.phone.number();
          break;
        case 'number':
          input.value = fakerInstance.number.int({ min: 1, max: 1000 });
          break;
        case 'date':
          input.value = fakerInstance.date.birthdate({ min: 18, max: 80, mode: 'age' }).toISOString().split('T')[0];
          break;
        case 'url':
        case 'website':
          input.value = fakerInstance.internet.url();
          break;
        case 'password':
          input.value = fakerInstance.internet.password({ length: 12, memorable: false });
          break;
        default: // text and others
          input.value = getFakeValue(name, id, fakerInstance);
      }

      // Trigger input event for frameworks that listen to changes
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      filledCount++;
    } catch (error) {
      console.error('Error filling input:', error);
    }
  });

  // Fill textareas
  textareas.forEach((textarea) => {
    if (textarea.offsetParent === null) return;

    try {
      textarea.value = fakerInstance.lorem.paragraph();
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
      filledCount++;
    } catch (error) {
      console.error('Error filling textarea:', error);
    }
  });

  // Fill selects with random option
  selects.forEach((select) => {
    if (select.offsetParent === null) return;

    try {
      const options = Array.from(select.options).filter(opt => opt.value && opt.value !== '');
      if (options.length > 0) {
        const randomOption = options[Math.floor(Math.random() * options.length)];
        select.value = randomOption.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
      }
    } catch (error) {
      console.error('Error filling select:', error);
    }
  });

  // Fill checkboxes randomly
  checkboxes.forEach((checkbox) => {
    if (checkbox.offsetParent === null) return;

    try {
      checkbox.checked = Math.random() > 0.5;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      filledCount++;
    } catch (error) {
      console.error('Error filling checkbox:', error);
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
      randomRadio.dispatchEvent(new Event('change', { bubbles: true }));
      filledCount++;
    } catch (error) {
      console.error('Error filling radio:', error);
    }
  });

  console.log(`Faker Form: Filled ${filledCount} form elements in form`);
  return filledCount;
}

/**
 * Get fake data value based on field type detection
 * @param {string} name - input name attribute
 * @param {string} id - input id attribute
 * @param {faker} faker - faker instance
 * @returns {string}
 */
function getFakeValue(name, id, faker) {
  const nameAttr = (name + id).toLowerCase();

  if (/first.?name|fname|given.?name/.test(nameAttr)) {
    return faker.person.firstName();
  }
  if (/last.?name|lname|family.?name|surname/.test(nameAttr)) {
    return faker.person.lastName();
  }
  if (/^name$|fullname|full.?name|username/.test(nameAttr)) {
    return faker.person.fullName();
  }
  if (/email|e.?mail|mail/.test(nameAttr)) {
    return faker.internet.email();
  }
  if (/phone|tel|telephone|mobile|cell/.test(nameAttr)) {
    return faker.phone.number();
  }
  if (/address|street|location|addr/.test(nameAttr)) {
    return faker.location.streetAddress();
  }
  if (/city|town/.test(nameAttr)) {
    return faker.location.city();
  }
  if (/state|province|region/.test(nameAttr)) {
    return faker.location.state({ abbreviated: true });
  }
  if (/zip|postal|pincode|postcode/.test(nameAttr)) {
    return faker.location.zipCode();
  }
  if (/country|nation/.test(nameAttr)) {
    return faker.location.country();
  }
  if (/company|organization|org|business/.test(nameAttr)) {
    return faker.company.name();
  }
  if (/website|url|homepage|web/.test(nameAttr)) {
    return faker.internet.url();
  }

  // Default: generic word
  return faker.lorem.word();
}
