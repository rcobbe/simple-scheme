"use strict";

/**********************************************************************
 *
 * General utility functions for iterable objects.
 *
 * Exports:
 *
 * isIterable :: a -> Boolean
 * andmap :: (a -> Boolean) Iterable<a> -> Boolean
 * ormap :: (a -> Boolean) Iterable<a> -> Boolean
 *
 **********************************************************************/

function isIterable(x) {
    return x !== null
        && x !== undefined
        && typeof(x[Symbol.iterator]) === "function";
}
exports.isIterable = isIterable;

exports.andmap = function andmap(f, seq) {
    console.assert(isIterable(seq));
    for (let x of seq) {
        if (!(f(x))) {
            return false;
        }
    }
    return true;
};

exports.ormap = function ormap(f, seq) {
    console.assert(isIterable(seq));
    for (let x of seq) {
        if (f(x)) {
            return true;
        }
    }
    return false;
};
