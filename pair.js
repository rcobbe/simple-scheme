"use strict";

/******************************************************************************
 *
 * Defines the type Pair<a, b>.
 *
 * Exports:
 *   pair :: a b -> Pair<a, b>
 *   isPair :: c -> Boolean
 *
 * Properties of Pair<a, b>
 *   fst :: a
 *   snd :: b
 *   toString :: () -> String
 *   equal :: c -> Boolean
 *
 *******************************************************************************/

var eq = require("./equal");

function pair(x, y) {
    return {
        get constructor() { return pair; },
        get fst() { return x; },
        get snd() { return y; },
        toString() {
            return "(" + this.fst.toString() + ", " + this.snd.toString() + ")";
        },
        equal(rhs) {
            return rhs.constructor === pair && eq.equal(this.fst, rhs.fst) && eq.equal(this.snd, rhs.snd);
        },
    };
}

exports.pair = pair;
exports.isPair = function isPair(x) { return x !== null && x !== undefined && x.constructor === pair; };