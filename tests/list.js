"use strict";

var test = require("tape");
var list = require("../list");

const testList = list.cons(1, list.cons(2, list.cons(3, list.empty)));

// Compares two lists for equality, using === on list elements. 
function listEqual(l1, l2) {
    while (!list.isEmpty(l1) && !list.isEmpty(l2)) {
        if (l1.car !== l2.car) {
            return false;
        }
        l1 = l1.cdr;
        l2 = l2.cdr;
    }
    return (list.isEmpty(l1) && list.isEmpty(l2));
}

test("iterator test", function (t) {
    let array = [];

    t.plan(2);

    for (let x of testList) {
        array.push(x);
    }
    t.deepEqual([1, 2, 3], array);

    let array2 = [];
    for (let x of list.empty) {
        array.push(x);
    }
    t.deepEqual([], array2);
});

test("toString test", function (t) {
    t.plan(2);
    t.equal(list.empty.toString(), "()");
    t.equal(testList.toString(), "(1, 2, 3)");
});

test("map test", function (t) {
    t.plan(2);
    t.deepEqual(list.empty, list.empty.map(x => x + 1));
    t.ok(
        listEqual(
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
    t.ok(listEqual(list.empty, list.fromArray([])));
    t.ok(listEqual(testList, list.fromArray([1, 2, 3])));
});