"use strict";

const path = require("path");
const fs = require("fs");
const converter = require("json-2-csv");
const cwd = process.cwd();
const exportPath = path.join(cwd, "ignore", "export");
const entryFileName = "SSSG_GTM-WNSLK5J_workspace155.json";
const jsonPath = path.join(cwd, "ignore", entryFileName);
const gtmJSON = require(jsonPath);

const tags = Array.from(gtmJSON.containerVersion.tag);

const mapTagArr = tags.map(tag => {
  const model = {
    tag_name: tag.name
  };
  const params = Array.from(tag.parameter);
  const paramNames = ["category", "action", "label"];

  params.forEach(param => {
    if (param.key === "eventName") model.ga4_event_name = param.value;

    if (param.key === "eventSettingsTable") {
      const customParams = Array.from(param.list);

      customParams.forEach(customParam => {
        const map = customParam.map;
        if (Array.isArray(map)) {
          let paramName, paramVal;

          map.forEach(el => {
            if (el.key === "parameter") paramName = paramNames.includes(el.value) ? `ga4_${el.value}` : el.value;
            if (el.key === "parameterValue") paramVal = el.value;
          });

          if (paramName) {
            model[paramName] = paramVal || "";
          }
        }
      });
    }
  });

  return model;
});

console.log(`Mapping ${mapTagArr.length} elements.`);

fs.writeFileSync(
  path.join(exportPath, entryFileName),
  JSON.stringify(mapTagArr, null, 4)
);

let ga4Tags = [];
let ga4TagKeyDef = [
  "tag_name",
  "ga4_category",
  "ga4_action",
  "ga4_label",
  "ga4_event_name",
];
let otherTags = [];

mapTagArr.forEach(tag => {
  let tagKeys = Object.keys(tag);
  let matched = tagKeys.filter(key => {
    return ga4TagKeyDef.includes(key);
  }).length;

  if (
    tagKeys.length === ga4TagKeyDef.length
        && matched === ga4TagKeyDef.length
  ) ga4Tags.push(tag);
  else otherTags.push(tag);
});

console.log(
  `
Filtering summary:
- GA4 tags: ${ga4Tags.length} elements
- Other tags: ${otherTags.length} elements
`
);

const option = {
  emptyFieldValue: "",
  // sortHeader: true
};

const ga4TagsCsv = converter.json2csv(ga4Tags, option);

const otherTagsCsv = converter.json2csv(otherTags, option);

const suffix = entryFileName.split(".")[0];

fs.writeFileSync(
  path.join(exportPath, `ga4_tags_${suffix}.csv`),
  ga4TagsCsv
);

fs.writeFileSync(
  path.join(exportPath, `other_tags_${suffix}.csv`),
  otherTagsCsv
);
