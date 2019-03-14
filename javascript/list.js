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
 *   fromIterable :: Iterable<a> -> List<a>
 *   toArray :: List<a> -> Array<a>
 *   list :: a... -> List<a>
 *
 * List<a> properties:
 *   equal :: b -> Bool
 *   car :: a  if list is not empty
 *   cdr :: list<a>  if list is not empty
 *   map :: (a -> b) -> List<b>
 *   sort :: (a a -> Number) -> List<a>
 *     returns copy of list sorted according to supplied comparison function.
 *     Put x {before, after, equiv to} y when comp(x, y) returns a number
 *     {less than, greater than, equal to} 0.  Results are defined only when
 *     compare(x, y) always returns the same value for any two values for x, y.
 *   reduce :: (b a -> b) b -> b
 *   reduceRight :: (b a -> b) b -> b
 *   append :: List<a> -> List<a>
 *   reverse :: () -> List<a>
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
var iterUtils = require("./iterable-utils");

const empty = {
    equal(x) { return x === empty; },
    [Symbol.iterator]: function iterator() { return mkIter(this); },
    toString() { return "()"; },
    map() { return empty; },
    sort() { return empty; },
    reduce(f, initialValue) { return initialValue; },
    reduceRight(f, initialValue) { return initialValue; },
    append(ys) { return ys; },
    reverse() { return empty; }
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
        sort(compare) {
            if (compare === undefined) {
                compare = (x, y) => { if (x < y) { return -1; } else if (x > y) { return 1; } else { return 0; } };
            }
            return fromIterable(toArray(this).sort(compare));
        },
        reduce(f, initialValue) {
            return this.cdr.reduce(f, f(initialValue, this.car));
        },
        reduceRight(f, initialValue) {
            return f(this.cdr.reduceRight(f, initialValue), this.car);
        },
        append(ys) {
            return cons(this.car, this.cdr.append(ys));
        },
        reverse() {
            let accum = empty;
            let curr = this;
            while (curr !== empty) {
                accum = cons(curr.car, accum);
                curr = curr.cdr;
            }
            return accum;
        }
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

function fromIterable(xs) {
    console.assert(
        iterUtils.isIterable(xs),
        "fromIterable: expected iterable, got %s", xs
    );
    let accum = empty;
    for (let x of xs) {
        accum = cons(x, accum);
    }
    return accum.reverse();
}
exports.fromIterable = fromIterable;

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

exports.list = function(...xs) { return fromIterable(xs); };
