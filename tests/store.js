"use strict";

var test = require("tape");
var eq = require ("../equal");
var list = require ("../list");
var store = require ("../store");

test("deref test", function (t) {
    t.plan(3);
    let addrSt = store.alloc(42, store.empty);
    let addr = addrSt.fst;
    let st = addrSt.snd;
    t.throws(
        () => {
            return store.deref(addr, store.empty);
        },
        /not allocated/
    );
    t.equal(store.deref(addr, st), 42);
    let addr2 = store.alloc(56, st).fst;
    t.throws(
        () => {
            return store.deref(addr2, st);
        },
        /not allocated/
    );
});

test("update test", function (t) {
    let addrSt = store.alloc(42, store.empty);
    let addr = addrSt.fst;
    let st = addrSt.snd;
    let st2 = store.update(addr, 43, st);

    t.plan(3);
    t.throws(
        () => { return store.update(addr, 1, store.empty); },
        /not allocated/
    );
    t.equal(store.deref(addr, st), 42);
    t.equal(store.deref(addr, st2), 43);
});

test("allocLots test", function (t) {
    let addrsSt = store.allocLots([6, 7, 8, 9], store.empty);
    let addrs = addrsSt.fst;
    let st = addrsSt.snd;
    t.plan(1);
    t.ok(
        eq.equal(
            list.list(6, 7, 8, 9),
            addrs.map(a => store.deref(a, st))
        )
    );
});