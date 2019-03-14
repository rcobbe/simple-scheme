"use strict";

/************************************************************
 *
 * Defines an Env<k, v> type.  Key identity is defined in terms of the === operator.
 *
 * Exports:
 *   empty :: (k k -> Boolean) -> Env<k, v>
 *   isEnv :: a -> Boolean
 *   bind :: Env<k, Addr> Store<v> k v -> { env :: Env<k, Addr>, store :: Store<v> }
 *   bindLots :: Env<k, Addr> Store<v> Iterable<{key :: k, value :: v}> -> {env :: Env<k, Addr>, store :: Store<v>}
 *     If a key appears multiple times in the argument, the leftmost binding takes precedence.
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
    // _eq :: k k -> Boolean
    // _bindings :: List<{key :: k, value :: v}>
    constructor(eq, bindings) {
        this._eq = eq;
        this._bindings = bindings;
    }

    lookup(key) {
        for (let {key: k, value: v} of this._bindings) {
            if (this._eq(k, key)) {
                return v;
            }
        }
        throw new Error("Env.lookup: key not bound: " + key);
    }

    extend(key, value) {
        return new Env(this._eq, list.cons({key: key, value: value}, this._bindings));
    }

    extendLots(keyValuePairs) {
        let kvp;
        if (Array.isArray(keyValuePairs)) {
            kvp = list.fromIterable(keyValuePairs);
        } else if (list.isList(keyValuePairs)) {
            kvp = keyValuePairs;
        } else {
            throw new TypeError("Env.extendLots: expected list or array; got " + keyValuePairs);
        }
        return new Env(this._eq, kvp.append(this._bindings));
    }

    toString() {
        let result = "Env:\n";
        for (let {key, value} of this._bindings) {
            result += "  " + key.toString() + " -> " + value.toString() + "\n";
        }
        return result;
    }
}

exports.empty = function empty(eq) { return new Env(eq, list.empty); };
exports.isEnv = function isEnv(x) { return x !== null && x !== undefined && x.constructor === Env; };

function bind(env, store, k, v) {
    let {store: newSt, addr} = store.alloc(v);
    return {env: env.extend(k, addr), store: newSt};
}
exports.bind = bind;

function bindLots(env, store, keyValuePairs) {
    let initAccum = {env: env, store: store};
    return keyValuePairs.reduceRight(
        ({env, store}, {key, value}) => bind(env, store, key, value),
        initAccum
    );
}
exports.bindLots = bindLots;
