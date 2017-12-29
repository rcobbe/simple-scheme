"use strict";

var test = require("tape");
var eq = require("../equal");

test("null/undefined test", function (t) {
    t.plan(3);
    t.ok(eq.equal(null, null));
    t.ok(eq.equal(undefined, undefined));
    t.notOk(eq.equal(null, undefined));
});

var tag = Symbol("tag");

function mkObj(a, b, c) {
    return { 
        [tag]: tag, 
        a: a, 
        b: b, 
        c: c,
        equal: function (rhs) {
            return Object.prototype.hasOwnProperty.call(rhs, tag) && this.a === rhs.a && this.b === rhs.b;
        }
    };
}

test("number test", function (t) {
    t.plan(4);
    t.ok(eq.equal(3, 3));
    t.notOk(eq.equal(3, 4));
    t.ok(eq.equal(NaN, NaN));
    t.notOk(eq.equal(3, NaN));
});

test("array test", function (t) {
    t.plan(5);
    t.ok(eq.equal([1, 2, 3], [1, 2, 3]));
    t.ok(eq.equal([], []));
    t.notOk(eq.equal([1, 2, 3], [1, 2, 3, 4]));
    t.ok(eq.equal([1, [2, 3], 4], [1, [2, 3], 4]));
    t.notOk(eq.equal([1, [2, 3], 4], [1, [2, 3, 5], 4]));
});

test("object test", function (t) {
    t.plan(3);
    t.ok(eq.equal(mkObj(1, 2, 3), mkObj(1, 2, 3)));
    t.ok(eq.equal(mkObj(1, 2, 3), mkObj(1, 2, 4)));
    t.notOk(eq.equal(mkObj(1, 2, 3), mkObj(1, 4, 3)));
});