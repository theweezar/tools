"use strict";

/**
 * Creates an instance of UnlimitedObject to manage key-value storage with quotas.
 * @constructor
 * @param {number} unitQuota - Maximum number of keys allowed per storage unit.
 */
function UnlimitedObject(unitQuota) {
  this.units = [{}];
  this.unitQuota = unitQuota;
  this.updateUnitInfo();
}

/**
 * Updates unit information when creating a new unit.
 */
UnlimitedObject.prototype.updateUnitInfo = function () {
  this.currentIndex = this.units.length - 1;
  this.totalUnits = this.units.length;
};

/**
 * Handles updating or setting data for a given key in a specified unit.
 * @param {number} unitIndex - The index of the storage unit.
 * @param {string} key - The key to update.
 * @param {*} value - The new value to set.
 * @param {Function} [transform] - Optional callback function for transformation.
 */
UnlimitedObject.prototype.handleData = function (unitIndex, key, value, transform) {
  if (transform && typeof transform === "function") {
    this.units[unitIndex][key] = transform(this.units[unitIndex][key], value);
  } else {
    this.units[unitIndex][key] = value;
  }
};

/**
 * Sets a key-value pair in the object, creating new storage units if necessary.
 * @param {string} key - The key to set.
 * @param {*} value - The value to store.
 * @param {Function} [transform] - Optional callback function for data transformation.
 */
UnlimitedObject.prototype.set = function (key, value, transform) {
  for (var i = 0; i < this.totalUnits; i++) {
    if (this.units[i][key]) {
      this.handleData(i, key, value, transform);
      return;
    }
  }

  // Check if the last unit key length reaches quota
  if (Object.keys(this.units[this.currentIndex]).length >= this.unitQuota) {
    this.units.push({});
    this.updateUnitInfo();
  }

  this.handleData(this.currentIndex, key, value, transform);
};

/**
 * Retrieves the value associated with a given key.
 * @param {string} key - The key to look up.
 * @returns {*} The value associated with the key, or undefined if not found.
 */
UnlimitedObject.prototype.get = function (key) {
  for (var i = 0; i < this.totalUnits; i++) {
    if (this.units[i][key]) return this.units[i][key];
  }
  return undefined;
};

/**
 * Get the total number of keys in all units.
 * @returns {number} - Total number of keys.
 */
UnlimitedObject.prototype.getTotalKeys = function () {
  return this.units.reduce(function (total, unit) {
    return total + Object.keys(unit).length;
  }, 0);
};

module.exports = UnlimitedObject;
