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
 *   allocated :: Addr -> Boolean
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

// Entry<a> ::= { addr :: Addr, val :: a, hidden :: Bool }
// Hidden entries work just like normal entries, except that Store's toString method
// doesn't print them.
function entry(addr, val, hidden) {
    return {
        get addr() { return addr; },
        get val() { return val; },
        get hidden() { return hidden; },
        withValue(newVal) { return entry(addr, newVal, hidden); }
    };
}

function compareEntry(e1, e2) { return e1.addr.compare(e2.addr); }

// store :: Addr List<Entry<a>> -> Store<a>
// Domains of two lists must be disjoint.  Only difference is that toString
// doesn't print contents of hiddenAddrValList, to avoid cluttering output
// with unnecessary details (intended primarily for builtin primitives).
function store(nextAddr, entryList) {
    console.assert(isAddr(nextAddr));
    console.assert(list.isList(entryList));
    // XXX assert that all items are entries?
    return {
        get constructor() { return store; },
        // as above, would prefer these to be private, but have to expose them for equal()
        get _nextAddr() { return nextAddr; },
        get _entryList() { return entryList; },
        toString() {
            let result = "Store:\n" +
                "  nextAddr: " + nextAddr.toString() + "\n" +
                "  entries: \n";
            for (let {addr, val, hidden} of entryList) {
                if (!hidden) {
                    result += "    " + addr.toString() + ": " + val.toString() + "\n";
                }
            }
            return result;
        },
        equal(rhs) {
            return isStore(rhs) && (
                eq.equal(nextAddr, rhs._nextAddr) &&
                eq.equal(entryList.sort(compareEntry), rhs._entryList.sort(compareEntry))
            );
        },
        alloc(newVal) {
            let a = nextAddr;
            let newNext = nextAddr.succ();
            return p.pair(a, store(newNext, list.cons(entry(a, newVal, false), entryList)));
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
        },
        allocated(addr) {
            for (let {addr: a} of entryList) {
                if (addr === a) {
                    return true;
                }
            }
            return false;
        },
        deref(addr) {
            for (let entry of entryList) {
                if (entry.addr === addr) {
                    return entry.val;
                }
            }
            throw new Error("store.deref: address " + addr + " is not allocated");
        },
        update(addr, newVal) {
            return store(nextAddr, updateLoop(entryList, addr, newVal));
        }
    };
}

// Returns copy of entryList with addr's value updated to newVal.  Throws Error if addr does not appear
// in entryList.
function updateLoop(entryList, addr, newVal) {
    if (list.isEmpty(entryList)) {
        throw new Error("store.update: address " + addr + " is not allocated");
    } else if (entryList.car.addr === addr) {
        return list.cons(entryList.car.withValue(newVal), entryList.cdr);
    } else {
        return list.cons(entryList.car, updateLoop(entryList.cdr, addr, newVal));
    }
}

function isStore(x) {
    return x !== undefined && x !== null && x.constructor === store;
}
exports.isStore = isStore;

exports.empty = store(addr(0), list.empty);
// Creates base store containing supplied values, as hidden
exports.baseStore = function baseStore(baseVals) {
    let finalAccum = baseVals.reduce(
        // accum :: Pair<Addr, List<Entry>; first element is next address to allocate
        (accum, val) => {
            let addr = accum.fst;
            let addrValPairs = accum.snd;
            let newAddr = addr.succ();
            return p.pair(newAddr, list.cons(
                p.pair(addr, val), addrValPairs));
        },
        p.pair(addr(0), list.empty)
    );

    return store(finalAccum.fst, finalAccum.snd);
};
