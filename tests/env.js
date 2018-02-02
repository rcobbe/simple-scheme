"use strict";

var test = require("tape");
var env = require("../env");
var store = require("../store");

function id(name) {
    return {
        get constructor() { return id; },
        get name() { return name; },
        equal(rhs) { return rhs.constructor === id && name === rhs.name; },
        toString() { return "Id(" + name + ")"; }
    };
}

function isId(x) {
    return x !== null && x !== undefined && x.constructor === id;
}

function eqId(x, y) {
    console.assert(isId(x));
    console.assert(isId(y));
    return x.equal(y); }

let empty = env.empty(eqId);
let testEnv = env.empty(eqId).extendLots(
    [
        {key: id("x"), value: 3},
        {key: id("y"), value: 4},
        {key: id("z"), value: 5}
    ]);

test("lookup", function(t) {
    t.plan(2);
    t.throws(() => empty.lookup(id("x")), /key not bound/);
    t.equal(testEnv.lookup(id("y")), 4);
});

test("extend", function (t) {
    t.plan(2);
    t.equal(testEnv.extend(id("a"), 14).lookup(id("y")), 4);
    t.equal(testEnv.extend(id("a"), 14).lookup(id("a")), 14);
});

test("extendLots", function (t) {
    let env2 = testEnv.extendLots([{key: id("a"), value: 15}, {key: id("b"), value: 25}, {key: id("a"), value: 64}]);
    t.plan(2);
    t.equal(env2.lookup(id("a")), 15);
    t.equal(env2.lookup(id("z")), 5);
});

test("bind", function (t) {
    let {env: e, store: st} = env.bind(empty, store.empty, id("x"), 14);
    t.plan(2);
    t.equal(st.deref(e.lookup(id("x"))), 14);
    t.throws(() => st.deref(e.lookup(id("y"))), /key not bound/);
});

test("bind lots", function(t) {
    let {env: e, store: st} = env.bindLots(testEnv, store.empty,
        [
            {key: id("x"), value: 54},
            {key: id("q"), value: 25},
            {key: id("x"), value: 16},
            {key: id("q"), value: 897}
        ]);
    t.plan(4);
    t.equal(st.deref(e.lookup(id("x"))), 54);
    t.equal(st.deref(e.lookup(id("q"))), 25);
    t.equal(e.lookup(id("y")), 4);
    t.throws(
        () => e.lookup(id("bogus")),
        /key not bound/
    );
});