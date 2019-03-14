"use strict";

var test = require("tape");
var store = require("../store");

// No tests of store.toString; too sensitive to minor changes and not needed for functionality.
// Plus, if we screw this up at some point, we'll find out during debugging pretty quickly.

test("basic lookup", function (t) {
    t.plan(4);

    let {store:st, addrs: [aAddr, bAddr]} = store.empty.allocLots(["a", "b"]);
    t.equal(st.deref(aAddr), "a");

    let st2 = st.update(bAddr, "z");
    t.equal(st.deref(bAddr), "b");
    t.equal(st2.deref(bAddr), "z");

    let {store:st3, addr: cAddr} = st.alloc("c", true);
    t.equal(st3.deref(cAddr), "c");
});
