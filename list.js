"use strict";

const empty = { 
    [Symbol.iterator]: function iterator() { return mkIter(this); },
    toString: function toString() { return "()"; },
    map: function() { return empty; },
};

exports.empty = empty;

function cons(x, y) { 
    return {
        car: x,
        cdr: y,
        [Symbol.iterator]: function iterator() { return mkIter(this); },
        toString: function toString() {
            let a = toArray(this);
            let strs = a.map(x => x.toString());
            return "(" + strs.join(", ") + ")";
        },
        map: function map(f) { return cons(f(x), y.map(f)); },
    }; 
}

exports.cons = cons;

function isEmpty(x) { return (x === empty); }

exports.isEmpty = isEmpty;

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
    return a.reduceRight(
        function(accum, x) {
            return cons(x, accum);
        },
        empty
    );
};

function toArray(l) {
    let result = [];
    while (!isEmpty(l)) {
        result.push(l.car);
        l = l.cdr;
    }
    return result;
}

exports.toArray = toArray;