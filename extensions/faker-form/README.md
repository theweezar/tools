# Faker Form - Chrome Extension

A powerful Chrome extension that instantly fills form fields with realistic fake data for testing and development purposes.

## Features

✨ **Intelligent Field Detection** - Automatically detects field types (name, email, phone, address, etc.) based on attributes and fills with appropriate fake data

📋 **Complete Form Support** - Handles all form elements:
- Text inputs
- Email inputs
- Phone inputs
- Number inputs
- Date inputs
- Textareas
- Select dropdowns (random selection)
- Checkboxes (random selection)
- Radio buttons (random selection)

⚡ **One-Click Operation** - Simply click the extension icon to fill all visible forms on the page

🎯 **Smart Matching** - Detects field names/IDs to provide contextually appropriate data:
- Names (first, last, full)
- Email addresses
- Phone numbers
- Street addresses
- Cities, states, ZIP codes, countries
- Companies
- Websites
- Passwords
- And more...

## Installation

### Prerequisites
- Chrome/Chromium-based browser
- Node.js (for icon generation)

### Setup Steps

1. **Install Dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Generate Extension Icon**:
   ```bash
   node extensions/faker-form/create-icon.js
   ```

3. **Load Extension in Chrome**:
   - Open `chrome://extensions/` in your browser
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `extensions/faker-form` folder
   - The extension should now appear in your Chrome toolbar

## Usage

1. Navigate to any website with a form
2. Click the **Faker Form** extension icon in your toolbar
3. Click the **"Fill Forms"** button in the popup
4. The extension will automatically fill all form fields with realistic fake data
5. Review the filled data and submit the form if needed

## File Structure

```
extensions/faker-form/
├── manifest.json              # Extension configuration (Manifest V3)
├── create-icon.js             # Icon generation script
├── public/
│   └── icons/
│       └── icon-128.png       # Extension icon
└── src/
    ├── background.js          # Background service worker
    ├── content.js             # Content script (injected into pages)
    ├── popup.html             # Popup UI
    ├── popup.js               # Popup logic
    └── popup.css              # Popup styling
```

## How It Works

### 1. **Content Script Injection**
- The `content.js` script runs on every page and injects the faker library from CDN
- Uses `@faker-js/faker` for generating realistic fake data

### 2. **Field Detection**
- When you click the extension icon, the popup sends a message to the content script
- The content script queries all form elements (inputs, textareas, selects, checkboxes, radios)
- Each field's `name` and `id` attributes are analyzed to determine the field type

### 3. **Data Filling**
- Based on field type detection:
  - **Text inputs**: Matched against patterns (firstName, email, address, etc.)
  - **Select dropdowns**: Random option selected
  - **Checkboxes**: Randomly checked/unchecked
  - **Radio buttons**: One random option selected per group
  - **Textareas**: Lorem ipsum paragraphs

### 4. **Events Triggered**
- After filling each field, `input` and `change` events are dispatched
- This ensures JavaScript frameworks (React, Vue, Angular, etc.) that listen to changes are notified

## Field Type Detection Patterns

The extension recognizes these patterns in field names and IDs:

| Field Type | Patterns |
|-----------|----------|
| First Name | `first_name`, `fname`, `given-name` |
| Last Name | `last_name`, `lname`, `surname` |
| Full Name | `name`, `fullname`, `full-name`, `username` |
| Email | `email`, `e-mail`, `mail` |
| Phone | `phone`, `tel`, `telephone`, `mobile`, `cell` |
| Address | `address`, `street`, `location` |
| City | `city`, `town` |
| State | `state`, `province`, `region` |
| ZIP Code | `zip`, `postal`, `pincode`, `postcode` |
| Country | `country`, `nation` |
| Company | `company`, `organization`, `business` |
| Website | `website`, `url`, `homepage` |
| Password | `password`, `passwd`, `pwd` |

## Technologies Used

- **Manifest Version**: 3
- **Faker Library**: @faker-js/faker v10.2.0 (CDN)
- **Browser APIs**: Chrome Extension APIs, DOM APIs

## Permissions

- `scripting` - To inject scripts into page content
- `activeTab` - To access the current active tab
- `<all_urls>` - To run on any website

## Development

### Icon Generation
```bash
node extensions/faker-form/create-icon.js
```

This generates a 128x128 PNG icon with a purple gradient background and white "F" letter.

### Testing
1. Load the unpacked extension in Chrome
2. Visit a test website with forms (e.g., sample form pages, contact forms)
3. Click the extension icon and verify forms are filled
4. Check browser console for any error messages

## Known Limitations

- Extension works only on websites with standard form elements
- Password fields are filled with generated values (may not meet complex requirements)
- Some dynamically generated forms might require page reload to be detected
- AJAX-loaded forms may need manual refresh detection

## Future Enhancements

- [ ] Add popup options for customizing data generation (locale, data types)
- [ ] Save preferences for specific websites
- [ ] Add ability to edit/preview generated data before filling
- [ ] Keyboard shortcut support
- [ ] Multi-language support
- [ ] Custom data templates

## License

ISC

## Support

For issues, suggestions, or contributions, please visit the repository on GitHub.

---

**Version**: 1.0.0  
**Last Updated**: January 2026
