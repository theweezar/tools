'use strict';

const path = require('path');
const moment = require('moment');
const helpers = require('../helpers/helpers');
const object = require('../object');
const cwd = process.cwd();

const CONFIG = {
    SOURCE: 'ignore/20250210_dev_ssjp_content-slots.xml',
    SLOT_ID: [
        'experience-product-new',
        'experience-product-best-seller',
        'experience-product-for-her',
        'experience-product-for-him',
    ],
    CONFIGURATION_ID: [],
    EXPORT_PATTERN: 'exported_ssjp-slots'
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

/**
 * Filter active slots
 * @param {Array} slotArray - Slot array
 * @returns {Array} - Active slots array
 */
function filterActiveSlots(slotArray) {
    return slotArray.filter(slotXmlObj => {
        const enableFlag = object.resolve(slotXmlObj, 'enabled-flag.0');
        return enableFlag && enableFlag === 'true';
    });
}

/**
 * Filter slots having highest rank
 * @param {Array} slotArray - Slot array
 * @returns {Array} - Slots array
 */
function filterSlotsHaveRank(slotArray) {
    const slotsHaveRank = slotArray.filter(slotXmlObj => {
        return Array.isArray(slotXmlObj.rank) && slotXmlObj.rank.length > 0;
    });

    if (slotsHaveRank.length === 0) return slotArray;

    if (slotsHaveRank.length === 1) return slotsHaveRank;

    const sortedSlots = slotsHaveRank.sort((a, b) => {
        let aRank = Number(a.rank[0]);
        let bRank = Number(b.rank[0]);
        return aRank - bRank;
    });

    if (sortedSlots.length === 1) return sortedSlots;

    return sortedSlots.filter(slotXmlObj => {
        return slotXmlObj.rank[0] === sortedSlots[0].rank[0];
    });
}

/**
 * Filter slot object
 * @param {Array} slotArray - Slot array
 * @returns {Array} - Filtered slot object array
 */
function filterSlotBySchedule(slotArray) {

}

/**
 * Filter slot object
 * @param {Array} slotArray - Slot array
 * @returns {Array} - Filtered slot object array
 */
function filterLatestActiveConfigurationIDInSlot(slotArray) {
    const slotGroup = {};
    const activeSlots = filterActiveSlots(slotArray);

    activeSlots.forEach(slotXmlObj => {
        const slotID = slotXmlObj.$ && slotXmlObj.$['slot-id'];
        if (!slotGroup[slotID]) slotGroup[slotID] = [];
        slotGroup[slotID].push(slotXmlObj);
    });

    let latestActiveSlots = [];

    Object.keys(slotGroup).forEach(slotID => {
        const group = slotGroup[slotID];
        const slotsHaveRank = filterSlotsHaveRank(group);
        latestActiveSlots = latestActiveSlots.concat(slotsHaveRank);
    });

    return latestActiveSlots;
}

async function main() {
    const xmlPath = path.join(cwd, CONFIG.SOURCE);
    const fullXmlObj = await helpers.xmlToJSON(xmlPath);

    const slotArray = object.resolve(fullXmlObj, 'slot-configurations.slot-configuration');
    const slotAssignmentArray = object.resolve(fullXmlObj, 'slot-configurations.slot-configuration-campaign-assignment');

    const relatedSlots = extractRelatedObjects(slotArray);
    const relatedSlotAssignments = extractRelatedObjects(slotAssignmentArray);

    // const latestActiveSlots = filterLatestActiveConfigurationIDInSlot(relatedSlots);

    object.set(fullXmlObj, 'slot-configurations.slot-configuration', relatedSlots);
    object.set(fullXmlObj, 'slot-configurations.slot-configuration-campaign-assignment', relatedSlotAssignments);

    const finalXml = helpers.buildXML(fullXmlObj);
    const date = moment().format('YYYYMMDDkkmmss');

    helpers.exportXml(xmlPath, finalXml, `${date}_${CONFIG.EXPORT_PATTERN}.xml`);
}

main();
