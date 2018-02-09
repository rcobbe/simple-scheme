"use strict";

var iterUtils = require("./iterable-utils");

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
    console.assert(iterUtils.andmap(x => typeof(x) === "string", body));
    for (let x of args) { console.assert(typeof(x) === "string"); }
    console.assert(isExp(body));
    return {
        [expTag]: expTag,
        expType: "lambda",
        args: iterUtils.toList(args),
        body: body
    };
};
exports.isLambda = mkPred("lambda");

/*
exports.letExp = function letExp(xs, rhss, body) {
    console.assert(Array.isArray(xs) || list.isList(xs));
*/