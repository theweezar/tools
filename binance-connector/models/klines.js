'use strict';

/**
 * Create date time string for model
 * @param {number} longTime - Time in long type
 * @returns {string} - date time string format 2024-12-07 12:55:43 ( YYYY-MM-DD HH:MM:SS )
 */
const parseTimeString = (longTime) => {
    let date = new Date(longTime);
    let dateJSON = date.toJSON();
    return dateJSON.split('T').join(' ').split('.')[0];
};

/**
 * @constructor
 * 
 * @param {Array} apiResponseArray - API response array
 */
function klines(apiResponseArray) {
    apiResponseArray.forEach(item => {
        this.push({
            openTime: parseTimeString(item[0]),
            openPrice: item[1],
            highPrice: item[2],
            lowPrice: item[3],
            closePrice: item[4],
            volume: item[5],
            closeTime: parseTimeString(item[6])
        });
    });
}

klines.prototype = [];

module.exports = klines;
