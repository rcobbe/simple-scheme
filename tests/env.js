"use strict";

var test = require("tape");
var env = require("../env");
var p = require("../pair");

test("env tests", function (t) {
    t.plan(6);
    t.throws(
        () => env.lookup("xyz", env.empty),
        /key not bound/
    );
    t.equal(
        3, 
        env.lookup("x", env.extend("x", 3, env.empty))
    );

    let extendedEnv = env.extendLots(
        [new p.Pair("x", 3), new p.Pair("y", 4), new p.Pair("x", 5), new p.Pair("z", 6)],
        env.empty
    );

    console.log(extendedEnv);
    t.equal(3, env.lookup("x", extendedEnv));
    t.equal(4, env.lookup("y", extendedEnv));
    t.equal(6, env.lookup("z", extendedEnv));
    t.throws(
        () => env.lookup("bogus", extendedEnv),
        /key not bound/
    );
});