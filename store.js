"use strict";

/***********************************************************************************
 *
 * Defines types Addr and Store<a>, a finite map from Addr to a.
 *
 * Exports:
 *   isAddr :: a -> Boolean
 *
 *   isStore :: a -> Boolean
 *   empty :: Store<a>
 *   baseStore :: List<a> -> Pair<List<Addr>, Store<a>>
 *
 * Addr properties:
 *   toString :: () -> String
 *   equal :: a -> Boolean
 *
 * Store<a> properties:
 *   toString :: () -> String
 *   equal :: b -> Boolean
 *   alloc :: a -> Pair<Addr, Store<a>>
 *   allocLots :: List<a> -> Pair<List<Addr>, Store<a>>
 *   deref :: Addr -> a             throws if addr not bound
 *   update :: Addr a -> Store<a>   throws if addr not bound
 *
 ***********************************************************************************/

var eq = require("./equal");
var list = require("./list");
var p = require("./pair");

function addr(n) {
    return {
        get constructor() { return addr; },
        // I'd prefer not to expose n, even read-only, but it's necessary for various methods
        get _n() { return n; },
        toString() { return "Addr(" + n + ")"; },
        equal(rhs) { return rhs.constructor === addr && n === rhs._n; },
        succ() { return addr(n + 1); },
        compare(rhs) { console.assert(isAddr(rhs)); return n - rhs._n; }
    };
}

function isAddr(x) {
    return x !== undefined && x !== null && x.constructor === addr;
}
exports.isAddr = isAddr;

// store :: Addr List<Pair<Addr, a>> List<Pair<Addr, a>> -> Store<a>
// Domains of two lists must be disjoint.  Only difference is that toString
// doesn't print contents of hiddenAddrValList, to avoid cluttering output
// with unnecessary details (intended primarily for builtin primitives).
function store(nextAddr, addrValList, hiddenAddrValList) {
    console.assert(isAddr(nextAddr));
    console.assert(list.isList(addrValList));
    console.assert(list.isList(hiddenAddrValList));
    // could also assert that domains of addrValList and hiddenAddrValList are disjoint, but
    // this requires a lot of additional infrastructure (sets, ordering on addresses, etc.)
    return {
        get constructor() { return store; },
        // as above, would prefer these to be private, but have to expose them for equal()
        get _nextAddr() { return nextAddr; },
        get _addrValList() { return addrValList; },
        get _hiddenAddrValList() { return hiddenAddrValList; },
        toString() {
            return "Store(nextAddr = " + nextAddr.toString() +
                ", addrValList = " + addrValList.toString() + ")";
        },
        equal(rhs) {
            let cmp = (a, b) => a.compare(b);
            return isStore(rhs) && (
                eq.equal(nextAddr, rhs._nextAddr) &&
                eq.equal(addrValList.sort(cmp), rhs._addrValList.sort(cmp)) &&
                eq.equal(hiddenAddrValList.sort(cmp), rhs._hiddenAddrValList.sort(cmp))
            );
        },
        alloc(newVal) {
            let a = nextAddr;
            let newNext = nextAddr.succ();
            let newPair = p.pair(a, newVal);
            return p.pair(a, store(newNext, list.cons(newPair, addrValList), hiddenAddrValList));
        },
        allocLots(newVals) {
            return newVals.reduceRight(
                // accum :: Pair<List<Address>, Store<a>>
                // val :: a
                (accum, val) => {
                    let addrs = accum.fst;
                    let newSt = accum.snd;
                    let result = newSt.alloc(val);
                    return p.pair(list.cons(result.fst, addrs), result.snd);
                },
                p.pair(list.empty, this)
            );
        }
    };
}

function isStore(x) {
    return x !== undefined && x !== null && x.constructor === store;
}
exports.isStore = isStore;

exports.empty = store(addr(0), list.empty, list.empty);
// Creates base store containing supplied values, as hidden
exports.baseStore = function baseStore(baseVals) {
    let finalAccum = baseVals.reduce(
        // accum :: Pair<Addr, List<Pair<Addr, a>; first element is next address to allocate
        (accum, val) => {
            let addr = accum.fst;
            let addrValPairs = accum.snd;
            let newAddr = addr.succ();
            return p.pair(newAddr, list.cons(p.pair(addr, val), addrValPairs));
        },
        p.pair(addr(0), list.empty)
    );

    return store(finalAccum.fst, list.empty, finalAccum.snd);
};