"use strict";

/************************************************************
 *
 * Defines an Env<k, v> type.
 *
 * Exports:
 *   empty :: Env<k, v>
 *   isEnv :: a -> Boolean
 *
 * Env<k, v> properties:
 *   lookup :: k -> v          throws if not bound
 *   extend :: k v -> Env<k, v>
 *   extendLots :: Iterable<{key :: k, value :: v}> -> Env<k, v>
 *     If a key appears multiple times in the argument, the leftmost binding takes precedence.
 *
 ************************************************************/

var list = require("./list");

class Env {
    // bindings :: List<{key :: k, value :: v}>
    constructor(bindings) {
        this._bindings = bindings;
    }

    lookup(key) {
        for (let {key: k, value: v} of this._bindings) {
            if (k === key) {
                return v;
            }
        }
        throw new Error("Env.lookup: key not bound: " + key);
    }

    extend(key, value) {
        return new Env(list.cons({key: key, value: value}, this._bindings));
    }

    extendLots(keyValuePairs) {
        return keyValuePairs.reduceRight(
            (env, {key, value}) => env.extend(key, value),
            this
        );
    }
}

exports.empty = new Env(list.empty);
exports.isEnv = function isEnv(x) { return x !== null && x !== undefined && x.constructor === Env; };