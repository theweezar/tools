"use strict";

const path = require("path");
const helpers = require("../helpers/helpers");
const assetHelpers = require("../helpers/assetHelpers");
const object = require("../lib/object");
const cwd = process.cwd();

const config = {
  source: "ignore/20250308_dev_AmericanTouristerSharedLibrary.xml",
  assetIDs: {
    "homepage-revamp-stay-social": ["*"],
    "home-revamp-why-shop-with-us": ["*"],
    "home-revamp-brand-story": ["*"],
    "homepage-revamp-css": ["*"],
    "homepage-revamp-whats-new": ["*"],
    "header-menu-content-revamp": ["*"],
    "footer-column-m-revamp": ["*"],
    "email-subscription-revamp": ["*"]
  },
  exportPattern: "exported_AmericanTouristerSharedLibrary"
};

/**
 * Filter custom attributes based on locale array
 * @param {Object} asset - Content Asset XML object
 * @param {Array} localeArr - Locale array
 */
function filterCustomAttrBasedOnLocale(asset, localeArr) {
  const customAttrs = object.resolve(asset, "custom-attributes.0.custom-attribute");
  let finalCustomAttrs = [];

  if (Array.isArray(customAttrs)) {
    let filteredCustomAttrs;

    if (localeArr.includes("*")) {
      filteredCustomAttrs = customAttrs;
    } else {
      filteredCustomAttrs = customAttrs.filter(attrXml => {
        const xmlLang = attrXml && attrXml.$ && attrXml.$["xml:lang"];
        return localeArr.includes(xmlLang);
      });
    }

    finalCustomAttrs = finalCustomAttrs.concat(filteredCustomAttrs);
  }

  return finalCustomAttrs;
}

function proceedToFilterAsset(xmlObj) {
  const contentMapByID = assetHelpers.createContentMapByID(xmlObj);
  return Object.keys(config.assetIDs).map(ID => {
    const asset = contentMapByID[ID];
    const locale = config.assetIDs[ID];

    if (asset && Array.isArray(locale)) {
      const filteredCustomAttrs = filterCustomAttrBasedOnLocale(asset, locale);
      object.set(asset, "custom-attributes.0.custom-attribute", filteredCustomAttrs);
      return asset;
    }

    return null;
  }).filter(asset => {
    return asset !== null;
  });
}

async function main() {
  const xmlPath = path.join(cwd, config.source);
  const fullXmlObj = await helpers.xmlToJSON(xmlPath);
  const filteredContents = proceedToFilterAsset(fullXmlObj);

  assetHelpers.proceedToExportXml(xmlPath, config.exportPattern, fullXmlObj, filteredContents, null);

  console.log(`Request to export ${Object.keys(config.assetIDs).length} content(s).`);
  console.log(`Exported ${filteredContents.length} content(s).`);
}

main();
