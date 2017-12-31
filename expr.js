"use strict";

/*******************************************************************************
 * 
 * Define an Expression ADT.
 * 
 * Exports:
 *   Quote :: String -> Expr
 *     (quote ...) form.  Properties:
 *       name :: String
 *   Id :: String -> Expr
 *     id reference.  Properties:
 *       name :: String
 *   Lambda :: Sequence<String> Expr -> Expr
 *       args :: List<String>
 *       body :: Expr
 *   Let :: Sequence<Pair<String, Expr>> Expr -> Expr
 *       bindings :: List<Pair<String, Expr>>
 *       body :: Expr
 *   Letrec :: Sequence<Pair<String, Expr>> Expr -> Expr
 *       bindings :: List<Pair<String, Expr>>
 *       body :: Expr
 *   Letcc :: String Expr -> Expr
 *       id :: String
 *       body :: Expr
 *   SetBang :: String Expr -> Expr
 *       id :: String
 *       rhs :: Expr
 *   If :: Expr Expr Expr - Expr
 *       test :: Expr
 *       consequent :: Expr
 *       alternate :: Expr
 *   And :: Sequence<Expr> -> Expr
 *       subexprs :: List<Expr>
 *   Or :: Sequence<Expr> -> Expr
 *       subexprs :: List<Expr>
 *   Begin :: Sequence<Expr> -> Expr
 *       subexprs :: List<Expr>
 *   App :: Expr Sequence<Expr> -> Expr
 *       rator :: Expr
 *       rand :: List<Expr>
 */

var list = require("./list");
var p = require("./pair");
var seq = require("./sequence.js");

function isExpr(x) {
    return x !== null && x !== undefined && (
        typeof(x) === "number" ||
        typeof(x) === "string" ||
        x.constructor === Quote ||
        typeof(x) === "boolean" ||
        x.constructor === Id ||
        x.constructor === Lambda ||
        x.constructor === Let ||
        x.constructor === Letrec ||
        x.constructor === Letcc ||
        x.constructor === SetBang ||
        x.constructor === If ||
        x.constructor === And ||
        x.constructor === Or ||
        x.constructor === Begin ||
        x.constructor === App
    );
}
exports.isExpr = isExpr;

function coerceToList(x) {
    if (Array.isArray(x)) {
        return list.fromArray(x);
    } else if (list.isList(x)) {
        return x;
    } else {
        throw new Error("coerceToList: unexpected arg: " + x);
    }
}

function Quote(sym) {
    console.assert(typeof(sym) === "string");
    this.name = sym;
    return this;
}
exports.Quote = Quote;

function Id(name) {
    console.assert(typeof(name) === "string");
    this.name = name;
    return this;
}
exports.Id = Id;

function Lambda(args, body) {
    console.assert(Array.isArray(args) || list.isList(args));
    console.assert(isExpr(body));
    this.args = coerceToList(args);
    this.body = body;
}
exports.Lambda = Lambda;

function Let(bindings, body) {
    console.assert(Array.isArray(bindings) || list.isList(bindings));
    console.assert(
        seq.andmap(
            x => p.isPair(x) && typeof(x.fst) === "string" && isExpr(x.snd),
            bindings
        )
    );
    console.assert(isExpr(body));

    this.bindings = coerceToList(bindings);
    this.body = body;
    return this;
}
exports.Let = Let;

function Letrec(bindings, body) {
    console.assert(Array.isArray(bindings) || list.isList(bindings));
    console.assert(
        seq.andmap(
            x => p.isPair(x) && typeof(x.fst) === "string" && isExpr(x.snd)
        )
    );
    console.assert(isExpr(body));

    this.bindings = coerceToList(bindings);
    this.body = body;
    return this;
}
exports.Letrec = Letrec;

function Letcc(id, body) {
    console.assert(typeof(id) === "string");
    console.assert(isExpr(body));
    this.id = id;
    this.body = body;
    return this;
}
exports.Letcc = Letcc;

function SetBang(id, rhs) {
    console.assert(typeof(id) === "string");
    console.assert(isExpr(rhs));

    this.id = id;
    this.rhs = rhs;
    return this;
}
exports.SetBang = SetBang;

function If(test, consequent, alternate) {
    console.assert(isExpr(test) && isExpr(consequent) && isExpr(alternate));
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
    return this;
}
exports.If = If;

function And(args) {
    console.assert(Array.isArray(args) || list.isList(args));
    console.assert(seq.andmap(isExpr, args));
    this.args = coerceToList(args);
    return this;
}
exports.And = And;

function Or(args) {
    console.assert(Array.isArray(args) || list.isList(args));
    console.assert(seq.andmap(isExpr, args));
    this.args = coerceToList(args);
    return this;
}
exports.Or = Or;

function Begin(subexprs) {
    console.assert(Array.isArray(subexprs) || list.isList(subexprs));
    console.assert(seq.andmap(isExpr, subexprs));
    this.subexprs = coerceToList(subexprs);
    return this;
}
exports.Begin = Begin;

function App(rator, rands) {
    console.assert(isExpr(rator));
    console.assert(Array.isArray(rands) || list.isList(rands));
    console.assert(seq.andmap(isExpr, rands));
    this.rator = rator;
    this.rands = coerceToList(rands);
    return this;
}
exports.App = App;