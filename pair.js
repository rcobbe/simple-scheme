"use strict";

/******************************************************************************
 * 
 * Defines the type Pair<a, b>.
 * 
 * Exports:
 *   Pair :: a b -> Pair<a, b>
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

function Pair(x, y) {
    this.fst = x;
    this.snd = y;
    this.toString = function toString() {
        return "(" + this.fst.toString() + ", " + this.snd.toString() + ")";
    };
    this.equal = function equal(rhs) {
        return rhs.constructor === Pair && eq.equal(this.fst, rhs.fst) && eq.equal(this.snd, rhs.snd);
    };
}

exports.Pair = Pair;
exports.isPair = function isPair(x) { return x !== null && x !== undefined && x.constructor === Pair; };