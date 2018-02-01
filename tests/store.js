"use strict";

var test = require("tape");
var store = require("../store");
var eq = require("../equal");

// No tests of store.toString; too sensitive to minor changes and not needed for functionality.
// Plus, if we screw this up at some point, we'll find out during debugging pretty quickly.