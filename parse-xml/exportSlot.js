'use strict';

const path = require('path');
const moment = require('moment');
const helpers = require('./helpers');
const dot = require('./dot');
const cwd = process.cwd();

const CONFIG = {
    SOURCE: 'ignore/20240908_dev_content-slots.xml',
    SLOT_ID: [
        'experience-product-best-seller',
        'experience-product-new',
    ],
    CONFIGURATION_ID: [],
    EXPORT_PATTERN: 'export-slot'
};

/**
 * Filter slot object
 * @param {Array} rawArray - Raw array
 * @returns {Array} - Filtered slot object array
 */
function extractRelatedObjects(rawArray) {
    if (Array.isArray(rawArray)) {
        return rawArray.filter(slotXmlObj => {
            let slotID = slotXmlObj.$ && slotXmlObj.$['slot-id'];
            if (CONFIG.SLOT_ID.includes(slotID)) return slotXmlObj;
        });
    }
    return [];
}

async function main() {
    const xmlPath = path.join(cwd, CONFIG.SOURCE);
    const fullXmlObj = await helpers.xmlToJSON(xmlPath);

    const slotArray = dot.getProp(fullXmlObj, 'slot-configurations.slot-configuration');
    const slotAssignmentArray = dot.getProp(fullXmlObj, 'slot-configurations.slot-configuration-campaign-assignment');

    const relatedSlots = extractRelatedObjects(slotArray);
    const relatedSlotAssignments = extractRelatedObjects(slotAssignmentArray);

    dot.set(fullXmlObj, 'slot-configurations.slot-configuration', relatedSlots);
    dot.set(fullXmlObj, 'slot-configurations.slot-configuration-campaign-assignment', relatedSlotAssignments);

    const finalXml = helpers.buildXML(fullXmlObj);
    const date = moment().format('YYYYMMDDkkmmss');
    helpers.exportXml(xmlPath, finalXml, `${date}_${CONFIG.EXPORT_PATTERN}.xml`);
}

main();
