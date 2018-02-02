"use strict";

var test = require("tape");
var list = require("../list");
var eq = require("../equal");

const testList = list.cons(1, list.cons(2, list.cons(3, list.empty)));

test("iterator test", function (t) {
    t.plan(2);
    {
        let array = [];
        for (let x of testList) {
            array.push(x);
        }
        t.deepEqual([1, 2, 3], array);
    }

    {
        let array = [];
        for (let x of list.empty) {
            array.push(x);
        }
        t.deepEqual([], array);
    }
});

test("toString test", function (t) {
    t.plan(2);
    t.equal(list.empty.toString(), "()");
    t.equal(testList.toString(), "(1, 2, 3)");
});

test("equal test", function (t) {
    let list1 = list.cons(1, list.cons(2, list.cons(3, list.empty)));
    let list2 = list.cons(1, list.cons(2, list.cons(3, list.empty)));
    let list3 = list.cons(list1, list.empty);
    let list4 = list.cons(list2, list.empty);
    t.plan(5);
    t.ok(eq.equal(list.empty, list.empty));
    t.ok(eq.equal(list1, list2));
    t.notOk(eq.equal(list.empty, list1));
    t.notOk(eq.equal(list1, list3));
    t.ok(eq.equal(list3, list4));
});

test("map test", function (t) {
    t.plan(2);
    t.deepEqual(list.empty, list.empty.map(x => x + 1));
    t.ok(
        eq.equal(
            list.cons(2, list.cons(3, list.cons(4, list.empty))),
            testList.map(x => x + 1)
        )
    );
});

test("toArray test", function (t) {
    t.plan(2);
    t.deepEqual(list.toArray(list.empty), []);
    t.deepEqual(list.toArray(testList), [1, 2, 3]);
});

test("fromArray test", function (t) {
    t.plan(2);
    t.ok(eq.equal(list.empty, list.fromArray([])));
    t.ok(eq.equal(testList, list.fromArray([1, 2, 3])));
});

test("sort tests", function (t) {
    let inputList = list.list(3, 1, 4, 2, 1);
    t.plan(2);

    t.ok(eq.equal(list.list(1, 1, 2, 3, 4), inputList.sort()));
    t.ok(eq.equal(list.list(4, 3, 2, 1, 1), inputList.sort((x, y) => y - x)));
});

test("reduce tests", function (t) {
    let inputList = list.list(1, 2, 3, 4);
    let f = function(accum, val) { return accum * 10 + val; };
    t.plan(2);
    t.equal(0, list.empty.reduce(f, 0));
    t.equal(1234, inputList.reduce(f, 0));
});

test("reduceRight", function (t) {
    let inputList = list.list(1, 2, 3, 4);
    let f = function(accum, val) { return accum * 10 + val; };
    t.plan(2);
    t.equal(0, list.empty.reduceRight(f, 0));
    t.equal(4321, inputList.reduceRight(f, 0));
});

test("append", function (t) {
    let l1 = list.list(1, 2, 3);
    let l2 = list.list("x", "y", "z");
    t.plan(4);
    t.equal(list.empty, list.empty.append(list.empty));
    t.ok(eq.equal(list.empty.append(l1), l1));
    t.ok(eq.equal(l2.append(list.empty), l2));
    t.ok(eq.equal(l1.append(l2), list.list(1, 2, 3, "x", "y", "z")));
});