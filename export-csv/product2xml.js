"use strict";

const path = require("path");
const fs = require("fs");
const converter = require("json-2-csv");
const cwd = process.cwd();
const csvPath = path.join(cwd, "ignore", "20250307_dev_Samsonite-products.csv");
const xmlExportPath = path.join(cwd, "ignore", "export", "0_20250307_rating_Samsonite-products.xml");

const csv = fs.readFileSync(csvPath, {
  encoding: "utf8"
});

const jsonArray = converter.csv2json(csv, {
  trimHeaderFields: true,
  trimFieldValues: true
});

const locale = "en-SG";

const xmlArray = jsonArray.filter(json => {
  return !!(json.c__StarRating__en_AU && json.c__StarRatingBase__en_AU && json.c__StarRatingCount__en_AU);
}).map(json => {
  return `
<product product-id="${json.ID}">
    <custom-attributes>
        <custom-attribute attribute-id="StarRating" xml:lang="${locale}">${json.c__StarRating__en_AU || "0"}</custom-attribute>
        <custom-attribute attribute-id="StarRatingBase" xml:lang="${locale}">${json.c__StarRatingBase__en_AU || "0"}</custom-attribute>
        <custom-attribute attribute-id="StarRatingCount" xml:lang="${locale}">${json.c__StarRatingCount__en_AU || "0"}</custom-attribute>
    </custom-attributes>
</product>
`;
});

const finalXml = `<?xml version="1.0" encoding="UTF-8"?>
<catalog xmlns="http://www.demandware.com/xml/impex/catalog/2006-10-31" catalog-id="Samsonite">
    ${xmlArray.join("\n")}
</catalog>`;

fs.writeFileSync(xmlExportPath, finalXml);
