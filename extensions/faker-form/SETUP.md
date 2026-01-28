# Faker Form Chrome Extension - Setup Guide

## ✅ What's Been Created

Your Chrome extension with Manifest V3 has been successfully created in `extensions/faker-form/` with the following structure:

```
extensions/faker-form/
├── manifest.json              # Extension configuration
├── create-icon.js             # Icon generation script
├── README.md                  # Comprehensive documentation
├── public/
│   └── icons/                 # Icon folder (ready for icon.png)
└── src/
    ├── background.js          # Service worker for Manifest V3
    ├── content.js             # Content script (runs on all pages)
    ├── faker.js               # Faker helper functions
    ├── popup.html             # Extension popup UI
    ├── popup.js               # Popup interaction logic
    └── popup.css              # Popup styling (modern gradient design)
```

## 📋 Files Overview

### manifest.json
- Manifest V3 configuration
- Defines permissions, content scripts, popup, and icons
- Extension name: "Faker Form"
- Improved description: "Instantly fill form fields with realistic fake data for testing and development"

### src/content.js
- Injects @faker-js/faker library from CDN
- Detects all form elements on the page
- Fills forms with intelligent matching:
  - **Inputs**: Smart detection of field types (text, email, phone, etc.)
  - **Textareas**: Lorem ipsum paragraphs
  - **Selects**: Random option selection
  - **Checkboxes**: Random selection
  - **Radio buttons**: Random selection per group

### src/faker.js
- Export-ready utility functions for field detection
- Functions: `isFirstName()`, `isLastName()`, `isName()`, `isEmail()`, `isPhone()`, `isAddress()`, `isCity()`, `isState()`, `isZipCode()`, `isCountry()`, `isCompany()`, `isWebsite()`, `isDate()`, `isPassword()`
- `getFakeValue()` function for context-aware data generation

### src/popup.html & popup.js & popup.css
- Clean, modern UI with gradient design
- Single "Fill Forms" button with emoji
- Success/error messaging
- Auto-closes after successful fill

### src/background.js
- Service worker for Manifest V3
- Handles extension lifecycle events
- Ready for additional message handling

## 🚀 Next Steps

### 1. Generate the Extension Icon
Run this command in the root directory:
```bash
node extensions/faker-form/create-icon.js
```

This creates a purple gradient icon with a golden sparkle at:
`extensions/faker-form/public/icons/icon-128.png`

### 2. Install in Chrome
1. Open `chrome://extensions/` in your browser
2. Toggle **"Developer mode"** (top-right corner)
3. Click **"Load unpacked"**
4. Navigate to and select the `extensions/faker-form` folder
5. The extension should appear in your Chrome toolbar

### 3. Test It Out
1. Visit any website with a form (e.g., a contact form, sign-up page)
2. Click the **Faker Form** icon in your toolbar
3. Click **"Fill Forms"** in the popup
4. Watch all form fields populate with realistic fake data! ✨

## 🎯 Key Features

✅ **Intelligent Field Detection**
- Recognizes field types by analyzing name/id attributes
- Supports 13+ field type patterns

✅ **Comprehensive Form Support**
- Text, email, phone, number, date, URL inputs
- Textareas
- Select dropdowns (random options)
- Checkboxes (random)
- Radio buttons (smart grouping)

✅ **Modern UI**
- Beautiful gradient design
- Responsive popup
- Success/error messages
- Clean, intuitive interface

✅ **Framework Friendly**
- Dispatches `input` and `change` events
- Works with React, Vue, Angular, and other frameworks

## 🔍 How It Works

1. **Content Script Injection**: When any page loads, `content.js` automatically loads faker library
2. **User Clicks Icon**: Popup appears with "Fill Forms" button
3. **Form Detection**: Content script queries all form elements
4. **Smart Filling**: 
   - Text inputs matched against field name patterns
   - Select/checkbox/radio elements randomly populated
   - Textareas filled with Lorem ipsum
5. **Event Dispatch**: All changes trigger input/change events
6. **Confirmation**: Popup shows success message and closes

## 🎨 Customization

### Change Extension Name/Description
Edit `manifest.json`:
```json
"name": "Your Extension Name",
"description": "Your custom description",
```

### Modify Field Detection Patterns
Edit `src/faker.js` or `src/content.js` to add/modify detection patterns:
```javascript
if (/your.?pattern|alternative/.test(nameAttr)) {
  return faker.internet.customField();
}
```

### Adjust Popup Design
Edit `src/popup.css` to change colors, fonts, layout, etc.

## 📊 Supported Faker Data Types

- First Name, Last Name, Full Name
- Email addresses
- Phone numbers
- Street addresses
- Cities, States, ZIP codes, Countries
- Company names
- Website URLs
- Birth dates
- Passwords (12-char random)
- Generic words/paragraphs

## 🔐 Permissions Used

- `scripting`: Required to inject content scripts
- `activeTab`: Required to access current tab
- `<all_urls>`: Required to run on any website

## 📝 Notes

- Icon generation requires `sharp` (already in your package.json)
- Faker library loaded from CDN for smallest extension size
- No data is collected or sent anywhere
- Extension works offline after initial install
- Safe to use on any website

## 🐛 Troubleshooting

**Forms not filling?**
- Refresh the page and try again
- Check browser console for errors
- Some pages might have CSP restrictions

**Icon not showing?**
- Run `node extensions/faker-form/create-icon.js`
- Reload the extension in `chrome://extensions/`

**Content script not injecting?**
- Ensure extension is enabled in `chrome://extensions/`
- Check browser console for errors

---

Enjoy using Faker Form! 🚀✨
