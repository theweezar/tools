'use strict';

/**
 * Creates an instance of unlimitedObject to manage key-value storage with quotas.
 * @constructor
 * @param {number} unitQuota - Maximum number of keys allowed per storage unit.
 */
function unlimitedObject(unitQuota) {
    this.data = [{}];
    this.unitQuota = unitQuota;
    this.reCalcDataInfo();
}

/**
 * Re-calculate data information when creating a new unit
 */
unlimitedObject.prototype.reCalcDataInfo = function () {
    this.index = this.data.length - 1;
    this.unitLength = this.data.length;
};

/**
 * Handles updating or setting data for a given key in a specified index.
 * @param {number} index - The index of the storage unit.
 * @param {string} key - The key to update.
 * @param {*} data - The new data to set.
 * @param {Function} [callback] - Optional callback function for transformation.
 */
unlimitedObject.prototype.handle = function (index, key, data, callback) {
    if (callback && typeof callback === 'function') {
        this.data[index][key] = callback(this.data[index][key], data);
    } else {
        this.data[index][key] = data;
    }
};

/**
 * Sets a key-value pair in the object, creating new storage units if necessary.
 * @param {string} key - The key to set.
 * @param {*} data - The data to store.
 * @param {Function} [callback] - Optional callback function for data transformation.
 */
unlimitedObject.prototype.set = function (key, data, callback) {
    for (let i = 0; i < this.unitLength; i++) {
        if (this.data[i][key]) {
            this.handle(i, key, data, callback);
            return;
        }
    }

    // Check if last unit key length reaches quota or not
    if (Object.keys(this.data[this.index]).length >= this.unitQuota) {
        this.data.push({});
        this.reCalcDataInfo();
    }

    this.handle(this.index, key, data, callback);
};

/**
 * Retrieves the value associated with a given key.
 * @param {string} key - The key to look up.
 * @returns {*} The value associated with the key, or undefined if not found.
 */
unlimitedObject.prototype.get = function (key) {
    for (let i = 0; i < this.unitLength; i++) {
        let unit = this.data[i];
        if (unit[key]) return unit[key];
    }
    return undefined;
};

module.exports = unlimitedObject;
