# Setup Instructions - Issues Fixed

## ✅ Issue 1: Import faker from node_modules
**Fixed** ✓
- Updated `src/content.js` to import `@faker-js/faker` from node_modules via bundling
- Created `build-extension.js` script using esbuild to bundle the extension
- Run `npm run build:extension` to bundle content.js with faker library

## ✅ Issue 2: Removed create-icon.js
**Fixed** ✓
- Deleted `create-icon.js` file as it was not requested

## ✅ Issue 3: Load all 4 icon sizes
**Fixed** ✓
- Updated `manifest.json` to reference all 4 icon sizes:
  - 16x16 (icon-16.png)
  - 48x48 (icon-48.png)
  - 128x128 (icon-128.png)
  - 256x256 (icon-256.png)

## 🚀 Build & Installation Steps

### 1. Build the extension
```bash
npm run build:extension
```
This bundles `src/content.js` with @faker-js/faker from node_modules and outputs to `dist/content.js`

### 2. Add icon files
Place your 4 icon PNG files in `extensions/faker-form/public/icons/`:
- icon-16.png (16x16 pixels)
- icon-48.png (48x48 pixels)
- icon-128.png (128x128 pixels)
- icon-256.png (256x256 pixels)

### 3. Load in Chrome
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extensions/faker-form` folder

### 4. Test
- Navigate to any website with a form
- Click the Faker Form extension icon
- Click "Fill Forms"
- All form fields should populate with fake data

## 📁 File Structure
```
extensions/faker-form/
├── manifest.json              (updated with 4 icon sizes, points to bundled script)
├── .gitignore                 (new: excludes dist/ and node_modules/)
├── public/
│   └── icons/                 (add your 4 PNG icons here)
├── src/
│   ├── background.js
│   ├── content.js             (updated: imports faker from node_modules)
│   ├── faker.js
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
└── dist/                      (generated after build: npm run build:extension)
    └── content.js             (bundled with faker)
```

## 🔧 Development

After making changes to `src/content.js`, run:
```bash
npm run build:extension
```

Then reload the extension in `chrome://extensions/`
