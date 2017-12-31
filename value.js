"use strict";

var continuation = require("./continuation");
var env = require("./env");
var expr = require("./expr");
var list = require("./list");
var store = require("./store");

exports.isValue = function isValue(x) {
    return (x !== null && x !== undefined && (
        typeof(x) === "number" ||
        typeof(x) === "string" ||
        x.constructor === exports.Symbol ||
        x === exports.nullVal ||
        typeof(x) === "boolean" ||
        x.constructor === exports.void ||
        x.constructor === exports.Pair ||
        x.constructor === exports.Closure ||
        // XXX primitives?
        x.constructor === exports.Continuation ||
        x.constructor === exports.undefined
    ));
};

exports.Symbol  = function Symbol(n) {
    this.name = n;
    return this;
};

exports.nullVal = { };

exports.void = { };

exports.Pair = function Pair(car, cdr) { 
    console.assert(store.isAddr(car));
    console.assert(store.isAddr(cdr));
    this.car = car;
    this.cdr = cdr;
    return this;
};

exports.Closure = function Closure(rho, formals, body) {
    console.assert(env.isEnv(rho));
    console.assert(list.isList(formals));
    formals.forEach((x) => console.assert(typeof(x) === "string"));
    console.assert(expr.isExpr(body));
    this.rho = rho;
    this.formals = formals;
    this.body = body;
    return this;
};

exports.Continuation = function Continuation(kappa) {
    console.assert(continuation.isContinuation(kappa));
    this.kappa = kappa;
    return this;
};

exports.undefined = { };