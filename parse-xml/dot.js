'use strict';

/**
 * Set value to object by dot
 * @param {Object} source - JSON object source
 * @param {string} path - JSON path seperated by dot
 * @param {*} value - Any value
 * @returns {void}
 */
const set = (source, path, value) => {
    let dotIdx = path.indexOf('.');

    // No more child -> current path is target property
    if (dotIdx === -1) {
        source[path] = value;
        return;
    }
    
    let prop = path.substring(0, dotIdx);
    let newPath = path.substring(dotIdx + 1);

    if (!source[prop] || typeof source[prop] !== 'object') source[prop] = {};
    
    return set(source[prop], newPath, value);
};

/**
 * Remove property
 * @param {Object} source - JSON object source
 * @param {string} path - JSON path seperated by dot
 */
const remove = (source, path) => {
    let dotIdx = path.indexOf('.');

    // No more child -> current path is target property
    if (dotIdx === -1) {
        delete source[path];
        return;
    }
    
    let prop = path.substring(0, dotIdx);
    let newPath = path.substring(dotIdx + 1);

    if (!source[prop]) return;
    
    return remove(source[prop], newPath);
};

/**
 * Get property value by path seperated by dot
 * @param {Object} source - JSON object sourccec
 * @param {string} path - JSON path seperated by dot
 * @returns {*} - any value
 */
const getProp = (source, path) => {
    if (!source || !path) return null;

    let cloneObj = source;
    let props = path.split('.');
    if (cloneObj) while (props.length) {
        let prop = props.shift();
        cloneObj = cloneObj[prop];
        if (!cloneObj) break;
    }
    return cloneObj;
}

module.exports = {
    set,
    remove,
    getProp
};
