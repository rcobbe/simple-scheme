"use strict";

/*******************************************************************************
 * 
 * Equality check intended to be similar to Scheme's equal?.  Intended to be
 * an equivalence relation; intended to be defined on all values in the language.
 *
 * Two objects x & y are equal under the following circumstances:
 *    - x === y
 *    - x.equal exists, is a method, and x.equal(y) is true
 *    - x and y are both arrays of the same length, and the corresponding
 *      pairs of elements are equal
 *    - x and y are both NaN
 * 
 * An implementation of the equal method can assume that its argument is neither
 * null nor undefined.
 * 
 *******************************************************************************/
exports.equal = function equal(x, y) {
    if (x === y) {
        // null === null, undefined === undefined
        return true;
    } else if (x === null || x === undefined || y === null || y === undefined) {
        return false;
    } else if (Array.isArray(x) && Array.isArray(y)) {
        if (x.length !== y.length) {
            return false;
        }
        for (let i = 0; i < x.length; i++) {
            if (!(equal(x[i], y[i]))) {
                return false;
            }
        }
        return true;
    } else if (Number.isNaN(x) && Number.isNaN(y)) {
        return true;
    } else if (Object.prototype.hasOwnProperty.call(x, "equal") && typeof(x.equal) === "function") {
        return x.equal(y);
    } else {
        return false;
    }
};