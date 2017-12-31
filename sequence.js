"use strict";

/**********************************************************************************
 * 
 * Functions that apply to general sequences.
 * 
 * Exports:
 *   andmap :: (a -> Boolean) Iterable<a> -> Boolean
 *     short-circuits
 *   ormap  :: (a -> Boolean) Iterable<a> -> Boolean
 *     short-circuits
 *
 **********************************************************************************/

exports.andmap = function andmap(f, seq) {
    for (let x of seq) {
        if (!(f(x))) {
            return false;
        }
    }
    return true;
};

exports.ormap = function ormap(f, seq) {
    for (let x of seq) {
        if (f(x)) {
            return true;
        }
    }
    return false;
};
