"use strict";

/************************************************************************
 *
 * Inductive list type.
 *
 * Exports:
 *   empty :: List<a>
 *   cons :: a List<a> -> List<a>
 *   isEmpty :: List<a> -> Bool
 *   isList :: a -> Bool
 *   fromArray :: Array<a> -> List<a>
 *   toArray :: List<a> -> Array<a>
 *
 * List<a> properties:
 *   equal: b -> Bool
 *   car: a  if list is not empty
 *   cdr: list<a>  if list is not empty
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

const empty = {
    equal(x) { return x === empty; },
    [Symbol.iterator]: function iterator() { return mkIter(this); },
    toString: function toString() { return "()"; },
    map: function() { return empty; },
};

exports.empty = empty;

function cons(x, y) {
    console.assert(isList(y), "cons: expected list as second arg; got %s", y);
    return {
        get constructor() { return cons; },
        get car() { return x; },
        get cdr() { return y; },
        equal(rhs) {
            return rhs.constructor === cons && eq.equal(this.car, rhs.car) && this.cdr.equal(rhs.cdr);
        },
        [Symbol.iterator]: function iterator() { return mkIter(this); },
        toString() {
            let a = toArray(this);
            let strs = a.map(x => x.toString());
            return "(" + strs.join(", ") + ")";
        },
        map(f) { return cons(f(x), y.map(f)); },
    };
}

exports.cons = cons;

function isEmpty(x) { return (x === empty); }
exports.isEmpty = isEmpty;

function isList(x) {
    return x !== null && x !== undefined && (x === empty || x.constructor === cons);
}
exports.isList = isList;

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

exports.fromArray = function fromArray(a) {
    console.assert(Array.isArray(a), "fromArray: expected array, got %s", a);
    return a.reduceRight(
        function(accum, x) {
            return cons(x, accum);
        },
        empty
    );
};

function toArray(l) {
    console.assert(isList(l), "toArray: expected list, got %s", l);
    let result = [];
    while (!isEmpty(l)) {
        result.push(l.car);
        l = l.cdr;
    }
    return result;
}

exports.toArray = toArray;
