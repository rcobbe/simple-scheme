"use strict";

var list = require("./list");
var p = require("./pair");

const bindings = Symbol("bindings");

/***********************************************************************************************
 * 
 * Defines an environment ADT.
 * 
 * Exports:
 *   isEnv :: a -> Boolean
 *   empty :: Env<key, value>
 *   lookup :: Env<key, value> key -> value
 *      throws if not found
 *   extend :: key value Env<key, value> -> Env<key, value>
 *   extendLots :: Reduceable<Pair<key, value>> Env<key, value> -> Env<key, value>
 *      if key appears multiple times, the leftmost binding takes precedence.
 *
 **********************************************************************************************/

// Env :: List<Pair<key, val>> -> Env<key, val>
function Env(bindingList) {
    console.assert(list.isList(bindingList));
    Object.defineProperty(
        this,
        bindings,
        {
            configurable: false,
            enumerable: false,
            value: bindingList,
            writeable: false
        }
    );
    return this;
}

function isEnv(x) { return x !== null && x !== undefined && x.constructor == Env; }
exports.isEnv = isEnv;

exports.empty = new Env(list.empty);

exports.lookup = function lookup(key, env) {
    console.assert(isEnv(env));
    for (var b of env[bindings]) {
        if (b.fst === key) {
            return b.snd;
        }
    }
    throw new Error("env.lookup: key not bound: " + key);
};

function extend(key, value, env) {
    console.assert(isEnv(env));
    return new Env(list.cons(new p.Pair(key, value), env[bindings]));
}

exports.extend = extend;

exports.extendLots = function extendLots(keyValuePairs, env) {
    return keyValuePairs.reduceRight(
        (envAccum, keyValPair) => extend(keyValPair.fst, keyValPair.snd, envAccum), 
        env
    );
};