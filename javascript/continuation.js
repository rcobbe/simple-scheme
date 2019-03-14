"use strict";

var env = require("./env");
var exp = require("./exp");
var iterUtils = require("./iterable-utils");
var st = require("./store");
var val = require("./value");

// tag to identify continuations; use of symbol means that it isn't easily spoofed.
const kTag = Symbol("kTag");

function isContinuation(x) {
    return x !== null && x !== undefined && Object.prototype.hasOwnProperty.call(x, kTag);
}
exports.isContinuation = isContinuation;

function mkPred(tag) {
    console.assert(typeof(tag) === "string");
    return x => (isContinuation(x) && x.kType === tag);
}

exports.haltK = function haltK() {
    return {
        [kTag]: kTag,
        kType: "halt"
    };
};
exports.isHaltK = mkPred("halt");

// rho: environment
// x: identifier (string) whose initializer we're currently evaluating
// xs: remaining identifiers
// rhss: remaining right-hand sides
exports.letrecK = function letrecK(rho, x, xs, rhss, body, k) {
    console.assert(env.isEnv(rho));
    console.assert(typeof(x) === "string");
    console.assert(iterUtils.isIterable(xs));
    console.assert(iterUtils.andmap(x => (typeof(x) === "string"), xs));
    console.assert(iterUtils.isIterable(rhss));
    console.assert(iterUtils.andmap(exp.isExp, rhss));
    console.assert(exp.isExp(body));
    console.assert(isContinuation(k));
    return {
        [kTag]: kTag,
        kType: "letrec",
        rho,
        x,
        xs,
        rhss,
        body,
        k
    };
};
exports.isLetrecK = mkPred("letrec");

exports.setK = function setK(a, k) {
    console.assert(st.isAddr(a));
    console.assert(isContinuation(k));
    return {
        [kTag]: kTag,
        kType: "set!",
        a,
        k
    };
};
exports.isSetK = mkPred("set!");

exports.ifK = function ifK(rho, consequent, alternative, k) {
    console.assert(env.isEnv(rho));
    console.assert(exp.isExp(consequent));
    console.assert(exp.isExp(alternative));
    console.assert(isContinuation(k));
    return {
        [kTag]: kTag,
        kType: "if",
        consequent,
        alternative,
        k
    };
};
exports.isIfK = mkPred("if");

function boolOpK(op, rho, exprs, k) {
    console.assert(op === "and" || op === "or");
    console.assert(env.isEnv(rho));
    console.assert(iterUtils.isIterable(exprs));
    console.assert(iterUtils.andmap(exp.isExp, exprs));
    console.assert(isContinuation(k));
    return {
        [kTag]: kTag,
        kType: op,
        rho,
        exprs,
        k
    };
}
exports.andK = boolOpK.bind(undefined, "and");
exports.isAndK = mkPred("and");
exports.orK = boolOpK.bind(undefined, "or");
exports.isOrK = mkPred("or");

exports.beginK = function beginK(rho, exprs, k) {
    console.assert(env.isEnv(rho));
    console.assert(iterUtils.isIterable(exprs));
    console.assert(iterUtils.andmap(exp.isExp, exprs));
    console.assert(isContinuation(k));
    return {
        [kTag]: kTag,
        kType: "begin",
        rho,
        exprs,
        k
    };
};
exports.isBeginK = mkPred("begin");

exports.ratorK = function ratorK(rho, rands, k) {
    console.assert(env.isEnv(rho));
    console.assert(iterUtils.isIterable(rands));
    console.assert(iterUtils.andmap(exp.isExp, rands));
    console.assert(isContinuation(k));
    return {
        [kTag]: kTag,
        kType: "rator",
        rho,
        rands,
        k
    };
};
exports.isRatorK = mkPred("rator");

// argValues: values of args evaluated so far, in *reverse* order
// remainingArgs: arg exprs yet to be evaluated, in source order
exports.randK = function randK(rho, func, argValues, remainingArgs, k) {
    console.assert(env.isEnv(rho));
    console.assert(val.isClosureVal(func));
    console.assert(iterUtils.isIterable(argValues));
    console.assert(iterUtils.andmap(val.isValue, argValues));
    console.assert(iterUtils.isIterable(remainingArgs));
    console.assert(iterUtils.andmap(exp.isExp, remainingArgs));
    console.assert(isContinuation(k));
    return {
        [kTag]: kTag,
        kType: "rand",
        rho,
        func,
        argValues,
        remainingArgs,
        k
    };
};
exports.isRandK = mkPred("rand");