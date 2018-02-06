"use strict";

var eq = require("./equal");
var env = require("./env");
var exp = require("./exp");
var k = require("./continuation");

function mkPred(tag) {
    console.assert(typeof(tag) === "string");
    return obj => (
        obj !== null &&
        obj !== undefined &&
        Object.prototype.hasOwnProperty.call(obj, "valueType") &&
        obj.valueType === tag
    );
}

const valueTags =
    [ "number", "string", "symbol", "boolean", "void", "pair", "closure", "continuation", "undefined" ];

function isValue(x) {
    return (
        x !== null &&
        x !== undefined &&
        Object.prototype.hasOwnProperty.call(x, "valueType") &&
        Array.prototype.includes.call(valueTags, x.valueTag)
    );
}

exports.numVal = function numVal(n) {
    console.assert(typeof(n) === "number");
    return {
        valueType: "number",
        value: n,
        equal(rhs) { return this.valueType === rhs.valueType && this.value === rhs.value; }
    };
};
exports.isNumVal = mkPred("number");

exports.strVal = function strVal(s) {
    console.assert(typeof(s) === "string");
    return {
        valueType: "string",
        value: s,
        equal(rhs) { return this.valueType === rhs.valueType && this.value === rhs.value; }
    };
};
exports.isStrVal = mkPred("string");

exports.symVal = function symVal(s) {
    console.assert(typeof(s) === "string");
    return {
        valueType: "symbol",
        value: s,
        equal(rhs) { return this.valueType === rhs.valueType && this.value === rhs.value; }
    };
};
exports.isSymVal = mkPred("symbol");

exports.nullVal = function nullVal() {
    return {
        valueType: "null",
        equal(rhs) { return this.valueType === rhs.valueType; }
    };
};
exports.isNullVal = mkPred("null");

exports.boolVal = function boolVal(b) {
    console.assert(typeof(b) === "boolean");
    return {
        valueType: "boolean",
        value: b,
        equal(rhs) { return this.valueType === rhs.valueType && this.value === rhs.value; }
    };
};
exports.isBoolVal = mkPred("boolean");

exports.voidVal = function voidVal() {
    return {
        valueType: "void",
        equal(rhs) { return this.valueType === rhs.valueType; }
    };
};
exports.isVoidVal = mkPred("void");

exports.pairVal = function pairVal(car, cdr) {
    console.assert(isValue(car));
    console.assert(isValue(cdr));
    return {
        valueType: "pair",
        car: car,
        cdr: cdr,
        equal(rhs) {
            return this.valueType === rhs.valueType && eq.equal(this.car, rhs.car) && eq.equal(this.cdr, rhs.cdr);
        }
    };
};
exports.isPairVal = mkPred("pair");

exports.closureVal = function closureVal(rho, formals, body) {
    console.assert(env.isEnv(rho));
    for (let x in formals) { console.assert(typeof(x) === "string"); }
    console.assert(exp.isExp(body));
    return {
        valueType: "closure",
        env: rho,
        formals: formals,
        body: body,
        equal(rhs) {
            return (this.valueType === rhs.valueType &&
                eq.equal(this.env, rhs.env) &&
                eq.equal(this.formals, rhs.formals) &&
                eq.equal(this.body, rhs.body));
        }
    };
};
exports.isClosureVal = mkPred("closure");

exports.continuationVal = function continuationVal(kappa) {
    console.assert(k.isContinuation(kappa));
    return {
        valueType: "continuation",
        k: kappa,
        equal(rhs) {
            return this.valueType === rhs.valueType && eq.equal(this.k, rhs.k);
        }
    };
};
exports.isContinuationVal = mkPred("continuation");

exports.undefinedVal = function undefinedVal() {
    return {
        valueType: "undefined",
        equal(rhs) { return this.valueType === rhs.valueType; }
    };
};
exports.isUndefinedVal = mkPred("undefined");

exports.isValue = isValue;
