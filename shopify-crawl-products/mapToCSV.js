"use strict";

const fs = require("fs");
const path = require("path");
const { createArrayCsvWriter } = require("csv-writer");
const cheerio = require("cheerio");
const cwd = process.cwd();
const config = require("./config.json");
const headerFile = path.join(__dirname, "header.txt");
const outputFile = path.join(cwd, config.csv.output || "products.csv");

/**
 * Lists all .js files in the client/js folder.
 * @param {string} rPath - relative path
 * @param {string} ext - file extension matching
 * @returns {Array} 
 */
function listFiles(rPath, ext) {
  const folderPath = path.join(cwd, rPath);
  try {
    const files = fs.readdirSync(folderPath, { withFileTypes: true });
    return files
      .filter(file => file.isFile() && file.name.endsWith(ext))
      .map(file => path.join(folderPath, file.name));
  } catch (error) {
    console.error(`Error reading folder: ${error.message}`);
    throw error;
  }
};

/**
 * Read HTML content from a file
 * @param {string} filePath - The path to the JSON file
 * @returns {string} - HTML content or empty string
 */
function readHtml(filePath) {
  try {
    const htmlPath = filePath.replace(/\.json$/i, ".html");
    if (!fs.existsSync(htmlPath)) return "";
    const html = fs.readFileSync(htmlPath, "utf8");
    return html || "";
  } catch (err) {
    return "";
  }
}

/**
 * Build the body description for a product
 * @param {string} html - The HTML content
 * @param {Object} product - The product object
 * @returns {string} - The HTML string for the body description
 */
function buildBodyDescription(html, product) {
  try {
    const $ = cheerio.load(html);
    /**
     * Change node tag name
     * @param {cheerio.Cheerio<AnyNode>} node - Cheerio node
     * @param {string} to - New node tag
     */
    const changeTagName = (node, to) => {
      const newTag = $(`<${to}>`);
      return newTag.append(node.html());
    };
    const selectors = [
      "#description .lg\\:col-span-5 .font-heading",
      "#description .lg\\:col-span-5 .text-base",
      "#description [data-hashchange-target=\"details-and-materials\"] h2",
      "#description [data-hashchange-target=\"details-and-materials\"] ul",
      "#description [data-hashchange-target=\"details-and-materials\"] ul + p"
    ];
    const finalHtml = selectors
      .map((sel) => {
        const self = $(sel);
        const els = self.removeAttr("class").toArray();
        if (!els || !els.length) return "";
        if (sel.includes("font-heading")) return els.map((el) => $.html(changeTagName($(el), "h2"))).join("");
        return els.map((el) => $.html(el)).join("");
      })
      .filter(Boolean)
      .join("");
    return finalHtml.trim() === "" ? product.description : finalHtml.trim();
  } catch (err) {
    console.error("build body description failed");
    return "";
  }
}

/**
 * Build meta tags from HTML content
 * @param {string} html - The HTML content
 * @returns {Object} - Meta tags object
 */
function buildMetaTags(html) {
  const $ = cheerio.load(html);
  const metaTags = {};
  $("meta").each((i, el) => {
    const nameAttr = $(el).attr("name");
    const propertyAttr = $(el).attr("property");
    const contentAttr = $(el).attr("content") || "";
    if (nameAttr) {
      metaTags[nameAttr] = contentAttr;
    } else if (propertyAttr) {
      metaTags[propertyAttr] = contentAttr;
    }
  });
  const titleTag = $("title").first().text() || "";
  return { ...metaTags, title: titleTag };
}

/**
 * Build main mapping array from headers. Each entry is { header, map }
 * map(jsonData, isMaster) should return string or primitive value
 * @param {Array} headers - array of header names
 * @returns {Array} mapping array
 */
function buildMainMap(headers) {
  const fmtPrice = (v) => (v === null || v === undefined || v === "") ? "" : (Number(v) / 100).toFixed(2);

  /**
   * Get first variant field value
   * @param {Object} product - product object
   * @param {string} field - field name
   * @returns {string|null} field value or null
   */
  const getFirstVariantValue = (product, field) => {
    return (Array.isArray(product.variants) && product.variants.length > 0) ? (product.variants[0][field] || null) : null;
  };

  const joinTags = (tags) => (Array.isArray(tags) ? tags.map(tag => {
    return String(tag).split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }).join(",") : "");

  /**
   * Get mapping function by header name
   * @param {string} header - header name
   * @returns {Function} mapping function
   */
  const byHeader = (header) => {
    switch (header) {
      case "Handle":
        return (p, isMaster) => p.handle || (p.url && p.url.split("/").pop()) || "";
      case "Title":
        return (p, isMaster) => isMaster ? (p.title || "") : "";
      case "Body (HTML)":
        return (p, isMaster) => isMaster ? (buildBodyDescription(p.html, p) || p.description || "") : "";
      case "Vendor":
        return (p, isMaster) => isMaster ? "FUSION" : "";
      case "Product Category":
        return () => "";
      case "Type":
        return (p, isMaster) => isMaster ? (p.type || "") : "";
      case "Tags":
        return (p, isMaster) => isMaster ? joinTags(p.tags) : "";
      case "Published":
        return (p, isMaster) => (p.published_at && isMaster ? "TRUE" : "");
      case "Option1 Name":
        return (p, isMaster) => isMaster ? (Array.isArray(p.options) && p.options[0] && p.options[0].name) || "" : "";
      case "Option1 Value":
        return (p, isMaster) => {
          if (isMaster) return (getFirstVariantValue(p, "option1") || "").toUpperCase();
          return (p && p._variant && p._variant.option1 ? p._variant.option1 : "").toUpperCase();
        };
      case "Option1 Linked To":
        return () => "";
      case "Option2 Name":
        return (p, isMaster) => isMaster ? (Array.isArray(p.options) && p.options[1] && p.options[1].name) || "" : "";
      case "Option2 Value":
        return (p, isMaster) => {
          if (isMaster) return (getFirstVariantValue(p, "option2") || "").toUpperCase();
          return (p && p._variant && p._variant.option2 ? p._variant.option2 : "").toUpperCase();
        };
      case "Option2 Linked To":
        return () => "";
      case "Option3 Name":
        return (p, isMaster) => isMaster ? (Array.isArray(p.options) && p.options[2] && p.options[2].name) || "" : "";
      case "Option3 Value":
        return (p, isMaster) => {
          if (isMaster) return (getFirstVariantValue(p, "option3") || "").toUpperCase();
          return (p && p._variant && p._variant.option3 ? p._variant.option3 : "").toUpperCase();
        };
      case "Option3 Linked To":
        return () => "";
      case "Variant SKU":
        return (p, isMaster) => {
          const splitSku = (sku) => {
            if (typeof sku !== "string") return "";
            const parts = sku.split("_");
            return parts.length > 1 ? parts[1] : sku;
          };
          if (isMaster && Array.isArray(p.variants) && p.variants.length > 0) {
            return splitSku(p.variants[0].sku) || "";
          }
          if (!isMaster && p._variant) {
            return splitSku(p._variant.sku) || "";
          }
          return "";
        };
      case "Variant Grams":
        return (p, isMaster) => {
          if (isMaster) return (Number(getFirstVariantValue(p, "weight")) || 0);
          return (p && p._variant && p._variant.weight ? Number(p._variant.weight) : 0);
        };
      case "Variant Inventory Tracker":
        return (p, isMaster) => "shopify";
      case "Variant Inventory Policy":
        return (p, isMaster) => "deny";
      case "Variant Fulfillment Service":
        return () => "manual";
      case "Variant Price":
        return (p, isMaster) => {
          if (!isMaster && p._variant && p._variant.price !== undefined) return fmtPrice(p._variant.price);
          return isMaster ? fmtPrice(p.price || p.price_min) : "";
        };
      case "Variant Compare At Price":
        return (p, isMaster) => (!isMaster && p._variant ? fmtPrice(p._variant.compare_at_price) : "");
      case "Variant Requires Shipping":
        return (p, isMaster) => "TRUE";
      case "Variant Taxable":
        return (p, isMaster) => "FALSE";
      case "Unit Price Total Measure":
      case "Unit Price Total Measure Unit":
      case "Unit Price Base Measure":
      case "Unit Price Base Measure Unit":
        return () => "";
      case "Variant Barcode":
        return (p, isMaster) => {
          if (isMaster) return getFirstVariantValue(p, "barcode") || "";
          return p._variant ? (p._variant.barcode || "") : "";
        };
      case "Image Src":
        return (p, isMaster) => {
          if (isMaster) {
            const first = getFirstVariantValue(p, "featured_image");
            return first ? first.src || "" : "";
          }
          return (p._variant && p._variant.featured_image ? (p._variant.featured_image.src || "") : "");
        };
      case "Image Position":
        return (p, isMaster) => {
          if (isMaster) {
            const first = getFirstVariantValue(p, "featured_image");
            return first ? first.position || "" : "";
          }
          return (p._variant && p._variant.featured_image ? (p._variant.featured_image.position || "") : "");
        };
      case "Image Alt Text":
        return (p, isMaster) => {
          if (isMaster) {
            const first = getFirstVariantValue(p, "featured_image");
            return first ? first.alt || "" : "";
          }
          return (p._variant && p._variant.featured_image ? (p._variant.featured_image.alt || "") : "");
        };
      case "Gift Card":
        return (p, isMaster) => isMaster ? (p.gift_card ? "TRUE" : "FALSE") : "";
      case "SEO Title":
        return (p, isMaster) => {
          if (!isMaster) return "";
          const metaTags = buildMetaTags(p.html);
          return metaTags.title || "";
        };
      case "SEO Description":
        return (p, isMaster) => {
          if (!isMaster) return "";
          const metaTags = buildMetaTags(p.html);
          return metaTags.description || "";
        };
      case "Google Shopping / Google Product Category":
      case "Google Shopping / Gender":
      case "Google Shopping / Age Group":
      case "Google Shopping / MPN":
      case "Google Shopping / Condition":
      case "Google Shopping / Custom Product":
      case "Google Shopping / Custom Label 0":
      case "Google Shopping / Custom Label 1":
      case "Google Shopping / Custom Label 2":
      case "Google Shopping / Custom Label 3":
      case "Google Shopping / Custom Label 4":
      case "Google: Custom Product (product.metafields.mm-google-shopping.custom_product)":
      case "Product rating count (product.metafields.reviews.rating_count)":
      case "Color (product.metafields.shopify.color-pattern)":
      case "Target gender (product.metafields.shopify.target-gender)":
      case "Complementary products (product.metafields.shopify--discovery--product_recommendation.complementary_products)":
      case "Related products (product.metafields.shopify--discovery--product_recommendation.related_products)":
      case "Related products settings (product.metafields.shopify--discovery--product_recommendation.related_products_display)":
      case "Search product boosts (product.metafields.shopify--discovery--product_search_boost.queries)":
        return () => "";
      case "Variant Image":
        return (p, isMaster) => {
          if (isMaster) {
            const first = getFirstVariantValue(p, "featured_image");
            return first ? first.src || "" : "";
          }
          return (p._variant && p._variant.featured_image ? (p._variant.featured_image.src || "") : "");
        };
      case "Variant Weight Unit":
      case "Variant Tax Code":
      case "Cost per item":
        return () => "";
      case "Status":
        return (p, isMaster) => isMaster ? (p.published_at ? "active" : "draft") : "";
      default:
        return () => "";
    }
  };

  return headers.map((h) => ({
    header: h,
    map: byHeader(h)
  }));
}

function buildMediaMapByID(product) {
  const map = {};
  if (!Array.isArray(product.media)) return map;
  product.media.forEach(media => {
    if (media.media_type !== "image") return;
    map[media.id] = {
      src: media.src,
      preview_image: {
        src: media.preview_image.src
      },
      position: media.position
    };
  });
  return map;
}

function processProducts() {
  const productFiles = listFiles(config.csv.entry, ".json");//.slice(0, 1);
  const raw = fs.readFileSync(headerFile, "utf8");
  const headers = raw.split(/\r?\n/).map((h) => h.trim()).filter(Boolean);
  const mainMap = buildMainMap(headers);

  const csvWriter = createArrayCsvWriter({
    header: mainMap.map(entry => entry.header),
    path: outputFile
  });
  const records = [];

  let counters = { products: 0, variants: 0 };

  productFiles.forEach((file) => {
    const product = require(file);
    counters.products += 1;

    const html = readHtml(file);
    const mediaMap = buildMediaMapByID(product);
    const masterData = Object.assign({}, product, { _variant: null }, { html: html, mediaMap: mediaMap });
    const masterRow = mainMap.map((entry) => entry.map(masterData, true));
    records.push(masterRow);

    // Variant rows
    const variants = Array.isArray(product.variants) ? product.variants.slice(1) : [];
    variants.forEach((variant) => {
      counters.variants += 1;
      const variantData = Object.assign({}, product, { _variant: variant }, { html: html, mediaMap: mediaMap });
      const row = mainMap.map((entry) => entry.map(variantData, false));
      records.push(row);
    });
  });

  csvWriter.writeRecords(records).then(() => {
    console.log(`Wrote ${counters.products} products and ${counters.variants} variants to ${outputFile}`);
  });
}

if (require.main === module) {
  processProducts();
}
