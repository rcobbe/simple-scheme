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

// Entry<a> ::= { addr :: Addr, val :: a, hidden :: Bool }
// Hidden entries work just like normal entries, except that Store's toString method
// doesn't print them.

function compareEntry(e1, e2) { return e1.addr.compare(e2.addr); }

// store :: Addr List<Entry<a>> -> Store<a>
// Domains of two lists must be disjoint.  Only difference is that toString
// doesn't print contents of hiddenAddrValList, to avoid cluttering output
// with unnecessary details (intended primarily for builtin primitives).
function store(nextAddr, entryList) {
    console.assert(isAddr(nextAddr));
    console.assert(list.isList(entryList));
    assertUnique(entryList);
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
            return p.pair(a, store(newNext, list.cons({ addr: a, val: newVal, hidden: false }, entryList)));
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
        deref(addr) {
            for (let x of this.addrValList) {
                if (x.fst === addr) {
                    return x.snd;
                }
            }
            for (let x of this.hiddenAddrValList) {
                if (x.first === addr) {
                    return x.snd;
                }
            }
            throw new Error("store.deref: address " + addr + " is not allocated");
        },
        update(addr, newVal) {

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

// assertUnique :: List<Entry<a>> -> ()
// asserts that all entries in the list have unique addresses.  Uses object identity for comparison, which is
// fine as long as the only way users can get an address is through the store API.
function assertUnique(entries) {
    let s = new Set();
    for (let { addr } of entries) {
        if (s.has(addr)) {
            throw new Error("found duplicate address: " + addr);
        } else {
            s.add(addr);
        }
    }
}
