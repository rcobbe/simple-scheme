"use strict";

/************************************************************************
 * 
 * Inductive list type.
 * 
 * Exports:
 *   empty :: List<a>
 *   cons :: a List<a> -> List<a>
 *   list :: a ... -> List<a>
 *   isEmpty :: List<a> -> Bool
 *   isList :: b -> Boolean
 *   fromArray :: Array<a> -> List<a>
 *   toArray :: List<a> -> Array<a>
 *   zip :: List<a> List<b> -> List<[a, b]>
 * 
 * List<a> properties:
 *   car: a  if list is not empty
 *   cdr: list<a>  if list is not empty
 *   toString :: () -> String
 *   equal :: b -> Boolean
 *   map: (a -> b) -> List<b>
 * 
 * List<a> implements the Iterable protocol.
 * 
 * XXX I've implemented the toString method on the List objects to return a
 * human-readable form of the list.  I'm a little nervous about this, since
 * I'm not sure when toString gets called or if other code depends on the
 * default toString output.  If this turns out to be an issue, fall back on
 * the "show" mechanism: rename toString to show below, and define a new
 * module that exports a single top-level function show(x), which calls
 * x.show() if it exists & calls x.toString() otherwise.  Then replace calls
 * to toString below with calls to show.
 *
 ***********************************************************************/

var eq = require("./equal");
var pair = require("./pair");

const empty = { 
    [Symbol.iterator]: function iterator() { return mkIter(this); },
    toString: function toString() { return "()"; },
    equal: function(x) { return x === empty; },
    map: function() { return empty; },
};

exports.empty = empty;

function Cons(x, y) {
    this.car = x;
    this.cdr = y;
    this[Symbol.iterator] = function iterator() { return mkIter(this); };
    this.toString = function toString() {
        let a = toArray(this);
        let strs = a.map(x => x.toString());
        return "(" + strs.join(", ") + ")";
    };
    this.equal = function equal(rhs) {
        return rhs.constructor === Cons && eq.equal(this.car, rhs.car) && eq.equal(this.cdr, rhs.cdr);
    };
    this.map = function map(f) { return new Cons(f(x), y.map(f)); };
}

exports.Cons = Cons;
exports.cons = function cons(x, y) { return new Cons(x, y); };

function fromArray(a) {
    console.assert(Array.isArray(a));
    return a.reduceRight(
        function(accum, x) {
            return new Cons(x, accum);
        },
        empty
    );
}

exports.list = function list(...xs) { return fromArray(xs); };

function isEmpty(x) { return (x === empty); }

exports.isEmpty = isEmpty;
exports.isList = function(x) { 
    return x !== null && x !== undefined && (x === empty || x.constructor === Cons);
};

function mkIter(l) {
    return {
        currList: l,
        next: function next() {
            if (isEmpty(this.currList)) {
                return { done: true };
            } else {
                let result = this.currList;
                this.currList = this.currList.cdr;
                return { done: false, value: result.car };
            }
        }
    };
}

exports.fromArray = fromArray;

function toArray(l) {
    console.assert(isEmpty(l) || l.constructor === Cons);
    let result = [];
    while (!isEmpty(l)) {
        result.push(l.car);
        l = l.cdr;
    }
    return result;
}

exports.toArray = toArray;

exports.zip = function zip(xs, ys) {
    if (isEmpty(xs) && isEmpty(ys)) {
        return empty;
    } else if (isEmpty(xs) || isEmpty(ys)) {
        throw new Error("zip: argument length mismatch");
    } else {
        return new Cons(new pair.Pair(xs.car, ys.car), zip(xs.cdr, ys.cdr));
    }
};
