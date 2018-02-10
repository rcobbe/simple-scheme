"use strict";

var iterUtils = require("./iterable-utils");
var list = require("./list");

// Tag that can't be easily spoofed to identify exp AST nodes
const expTag = Symbol("expTag");

function isExp(x) {
    return x !== null &&
        x !== undefined &&
        Object.prototype.hasOwnProperty.call(x, expTag);
}
exports.isExp = isExp;

function mkPred(tag) {
    console.assert(typeof(tag) === "string");
    return obj => (isExp(obj) && obj.expType === tag);
}

exports.numExp = function numExp(n) {
    console.assert(typeof(n) === "number");
    return {
        [expTag]: expTag,
        expType: "number",
        value: n
    };
};
exports.isNumExp = mkPred("number");

exports.strExp = function strExp(s) {
    console.assert(typeof(s) === "string");
    return {
        [expTag]: expTag,
        expType: "string",
        value: s
    };
};
exports.isStrExp = mkPred("string");

exports.symExp = function symExp(s) {
    console.assert(typeof(s) === "string");
    return {
        [expTag]: expTag,
        expType: "symbol",
        value: s
    };
};
exports.isSymExp = mkPred("symbol");

exports.boolExp = function boolExp(b) {
    console.assert(typeof(s) === "boolean");
    return {
        [expTag]: expTag,
        expType: "boolean",
        value: b
    };
};
exports.isBoolExp = mkPred("boolean");

exports.id = function id(x) {
    console.assert(typeof(x) === "string");
    return {
        [expTag]: expTag,
        expType: "id",
        name: x
    };
};
exports.isId = mkPred("id");

exports.lambda = function lambda(args, body) {
    console.assert(iterUtils.isIterable(args));
    console.assert(iterUtils.andmap(x => typeof(x) === "string", args));
    console.assert(isExp(body));
    return {
        [expTag]: expTag,
        expType: "lambda",
        args: iterUtils.toList(args),
        body: body
    };
};
exports.isLambda = mkPred("lambda");

exports.letExp = function letExp(xs, rhss, body) {
    console.assert(iterUtils.isIterable(xs));
    console.assert(iterUtils.andmap(x => typeof(x) === "string"), xs);
    console.assert(iterUtils.isIterable(rhss));
    console.assert(iterUtils.andmap(isExp, rhss));
    console.assert(iterUtils.length(xs) === iterUtils.length(rhss));
    console.assert(isExp(body));
    return {
        [expTag]: expTag,
        expType: "let",
        xs: xs,
        rhss: rhss,
        body: body
    };
};
exports.isLetExp = mkPred("let");

exports.letrecExp = function letrecExp(xs, rhss, body) {
    console.assert(iterUtils.isIterable(xs));
    console.assert(iterUtils.andmap(x => typeof(x) === "string"), xs);
    console.assert(iterUtils.isIterable(rhss));
    console.assert(iterUtils.andmap(isExp, rhss));
    console.assert(iterUtils.length(xs) === iterUtils.length(rhss));
    console.assert(isExp(body));
    return {
        [expTag]: expTag,
        expType: "letrec",
        xs: xs,
        rhss: rhss,
        body: body
    };
};
exports.isLetrecExp = mkPred("letrec");

exports.letccExp = function letccExp(x, body) {
    console.assert(typeof(x) === "string");
    console.assert(isExp(body));
    return {
        [expTag]: expTag,
        expType: "let/cc",
        x: x,
        body: body
    };
};
exports.isLetccExp = mkPred("let/cc");

exports.setExp = function setExp(x, rhs) {
    console.assert(typeof(x) === "string");
    console.assert(isExp(rhs));
    return {
        [expTag]: expTag,
        expType: "set!",
        x: x,
        rhs: rhs
    };
};
exports.isSetExp = mkPred("set!");

exports.ifExp = function ifExp(test, consequent, alternative) {
    console.assert(isExp(test));
    console.assert(isExp(consequent));
    console.assert(isExp(alternative));
    return {
        [expTag]: expTag,
        expType: "if",
        test: test,
        consequent: consequent,
        alternative: alternative
    };
};
exports.isIfExp = mkPred("if");

exports.andExp = function andExp(...args) {
    console.assert(iterUtils.andmap(isExp, args));
    return {
        [expTag]: expTag,
        expType: "and",
        args: list.fromIterable(args)
    };
};
exports.isAndExp = mkPred("and");

exports.orExp = function orExp(...args) {
    console.assert(iterUtils.andmap(isExp, args));
    return {
        [expTag]: expTag,
        expType: "or",
        args: list.fromIterable(args)
    };
};
exports.isOrExp = mkPred("or");

exports.beginExp = function beginExp(...exps) {
    console.assert(iterUtils.andmap(isExp, exps));
    return {
        [expTag]: expTag,
        expType: "begin",
        bodyExps: list.fromIterable(exps)
    };
};
exports.isBeginExp = mkPred("begin");

exports.appExp = function appExp(rator, ...rands) {
    console.assert(isExp(rator));
    console.assert(iterUtils.andmap(isExp, rands));
    return {
        [expTag]: expTag,
        expType: "app",
        rator: rator,
        rands: list.fromIterable(rands)
    };
};
exports.isAppExp = mkPred("app");