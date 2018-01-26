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
    toString() { return "()"; },
    map() { return empty; },
    sort() { return empty; }
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
            return fromArray(toArray(this).sort(compare));
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

function fromArray(a) {
    console.assert(Array.isArray(a), "fromArray: expected array, got %s", a);
    return a.reduceRight(
        function(accum, x) {
            return cons(x, accum);
        },
        empty
    );
}
exports.fromArray = fromArray;

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

exports.list = function(...xs) { return fromArray(xs); };
