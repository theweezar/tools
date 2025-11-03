"use strict";

const fs = require("fs");
const argv = process.argv;
const jsonFile = argv[2];

const json = require(jsonFile);

function formatJSON(obj) {
  return JSON.stringify(obj, (key, value) => {
    if (Array.isArray(value)) {
      let isAllString = value.every(el => {
        return typeof el === "string";
      });
      let arrayJSON = JSON.stringify(value).split(",").join(", ");
      arrayJSON = isAllString ? arrayJSON.toLowerCase() : arrayJSON;
      return arrayJSON;
    }
    return value;
  }, 4).replace(/"(\[.*?\])"/g, "$1").replace(/\\/g, "");
};

try {
  const newJsonStr = formatJSON(json);
  fs.writeFileSync(jsonFile, newJsonStr);
} catch (error) {
  console.log(error);
}
