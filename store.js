"use strict";

var list = require("./list");
var p = require("./pair");
var eq = require("./equal");

/***********************************************************************************
 * 
 * Exports:
 *   empty :: Store<a>
 *   isStore :: a -> Boolean
 *   alloc :: a Store<a> -> Pair<Addr, Store<a>>
 *   allocLots :: Union<List<a>, Array<a>> Store<a> -> Pair<List<Addr>, Store<a>>
 *   deref :: Addr Store<a> -> a   throws if addr is not bound
 *   update :: Addr a Store<a> -> Store<a>   throws if addr is not bound
 * 
 * Store<a> Properties: toString, equal
 * 
 ***********************************************************************************/

const addr = Symbol("addr");

function Addr(n) {
    Object.defineProperty(this, addr, {
        configurable: false,
        enumerable: false,
        value: n,
        writable: false
    });
    this.toString = function toString() { return "Addr(" + this[addr] + ")"; };
    this.equal = function equal(rhs) { 
        return rhs.constructor === Addr && rhs[addr] === this[addr];
    };
    this.succ = function succ() {
        return new Addr(this[addr] + 1);
    };
    return this;
}

const nextAddress = Symbol("nextAddress");
const alist = Symbol("alist");

function Store(nextAddr, addrValList) {
    Object.defineProperty(this, nextAddress, {
        configurable: false,
        enumerable: false,
        value: nextAddr,
        writable: false
    });
    Object.defineProperty(this, alist, {
        configurable: false,
        enumerable: false,
        value: addrValList,
        writable: false
    });
    this.toString = function toString() {
        return "Store(nextAddr = " + this[nextAddress] + ", values list = " + this[alist] + ")";
    };
    this.equal = function equal(rhs) {
        return rhs.constructor === Store && eq.equal(this[nextAddress], rhs[nextAddress]) && eq.equal(this[alist], rhs[alist]);
    };
    return this;
}

function isStore(x) {
    return x !== null && x !== undefined && x.constructor === Store;
}
exports.isStore = isStore;

var empty = new Store(new Addr(0), list.empty);
exports.empty = empty;

function alloc(val, st) {
    console.assert(isStore(st));
    let addr = st[nextAddress];
    return new p.Pair(
        addr,
        new Store(addr.succ(), list.cons(new p.Pair(addr, val), st[alist]))  
    );
}
exports.alloc = alloc;

function allocLots(vals, st) {
    return vals.reduceRight(
        // accum :: Pair<List<Address>, Store<T>>
        // val :: T
        (accum, val) => {
            let addrs = accum.fst;
            let newSt = accum.snd;
            let result = alloc(val, newSt);
            return new p.Pair(list.cons(result.fst, addrs), result.snd);
        },
        new p.Pair(list.empty, st)
    );
}
exports.allocLots = allocLots;

exports.deref = function deref(addr, st) {
    console.assert(isStore(st));
    for (let x of st[alist]) {
        if (x.fst === addr) {
            return x.snd;
        }
    }
    throw new Error("store.deref: address " + addr + " is not allocated");
};

exports.update = function update(addr, val, st) {
    console.assert(isStore(st));
    function updateLoop(alist) {
        if (list.isEmpty(alist)) {
            throw new Error("store.update: address " + addr + " is not allocated");
        } else if (alist.car.fst === addr) {
            return list.cons(new p.Pair(addr, val), alist.cdr);
        } else {
            return list.cons(alist.car, updateLoop(alist.cdr));
        }
    }
    return new Store(st[nextAddress], updateLoop(st[alist]));
};
