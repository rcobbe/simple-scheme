"use strict";

/**********************************************************************************
 * 
 * Functions that apply to general sequences.
 * 
 * A Sequence<a> is either a List<a> or an Array<a>.
 * 
 * Exports:
 *   andmap :: (a -> Boolean) Sequence<a> -> Boolean
 *     short-circuits
 *   ormap  :: (a -> Boolean) Sequence<a> -> Boolean
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
