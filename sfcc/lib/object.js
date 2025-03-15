'use strict';

/**
 * @module object
 */

/**
 * Deep copies all all object properties from source to target
 *
 * @param {Object} target The target object which should be extended
 * @param {Object} source The object for extension
 * @return {Object}
 */
exports.extend = function (target, source) {
    let _source;

    if (!target) {
        return source;
    }

    for (let i = 1; i < arguments.length; i++) {
        _source = arguments[i];
        for (let prop in _source) {
            // recurse for non-API objects
            if (_source[prop] && 'object' === typeof _source[prop] && !_source[prop].class) {
                target[prop] = this.extend(target[prop], _source[prop]);
            } else {
                target[prop] = _source[prop];
            }
        }
    }

    return target;
};

/**
 * Access given properties of an object recursively
 *
 * @param {Object} object The object
 * @param {String} propertyString The property string, i.e. 'data.myValue.prop1'
 * @return {Object} The value of the given property or undefined
 * @example
 * let prop1 = require('~/object').resolve(obj, 'data.myValue.prop1')
 */
exports.resolve = function (object, propertyString) {
    let result = object;
    let propPath = propertyString.split('.');

    propPath.forEach(function (prop) {
        if (result && prop in result) {
            result = result[prop];
        } else {
            result = null;
        }
    });
    return result;
};

/**
 * Assign value to object's property
 * 
 * @param {Object} object - JSON object
 * @param {string} path - The property string, i.e. 'data.myValue.prop1'
 * @param {Object} value - Any value
 */
exports.set = function (object, path, value) {
    let result = object ? object : {};
    let propPath = path.split('.');
    let prop = propPath.shift();

    if (propPath.length === 0) {
        result[prop] = value;
    } else {
        let nextPropPath = propPath.join('.');
        if (!result[prop] || typeof result[prop] !== 'object') result[prop] = {};
        this.set(result[prop], nextPropPath, value);
    }
};
