"use strict";

var test = require("tape");
var iterUtils = require("../iterable-utils");

function f(x) {
    if (typeof(x) === "number") {
        return x > 0;
    } else {
        throw new Error("bad input");
    }
}

test("andmap", function (t) {
    t.plan(4);

    t.equal(true, iterUtils.andmap(f, []));
    t.equal(true, iterUtils.andmap(f, [1, 2, 3]));
    t.equal(false, iterUtils.andmap(f, [1, -2, 3]));
    t.equal(false, iterUtils.andmap(f, [1, -2, "xyz"]));
});

test("ormap", function (t) {
    t.plan(4);
    t.equal(false, iterUtils.ormap(f, []));
    t.equal(true, iterUtils.ormap(f, [-1, -2, 3]));
    t.equal(false, iterUtils.ormap(f, [-1, -2, -3]));
    t.equal(true, iterUtils.ormap(f, [-1, 2, "xyz"]));
});
