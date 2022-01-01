#![allow(dead_code)]

use std::rc::{Rc, Weak};

#[derive(PartialEq, Eq, Clone)]
pub struct Id(String);

pub enum Value {
    Int(i32),
    String(String),
    Null,
    True,
    False,
    Pair(Rc<Value>, Rc<Value>),
    Closure(Env, Id, Rc<Expr>),
    Prim(Primitive),
}

pub enum Primitive {
    Add,         // curried addition function
    AddArg(i32), // Add applied to one argument
    Sub,         // as above
    SubArg(i32),
    Equal,
    EqualArg(i32),
    NullP,
    Cons,
    ConsArg(Rc<Value>),
    Car,
    Cdr,
}

pub enum Expr {
    Int(i32),
    String(String),
    True,
    False,
    Id(Id),
    Lambda {
        arg: Id,
        body: Rc<Expr>,
    },
    App {
        rator: Rc<Expr>,
        rand: Rc<Expr>,
    },
    Let {
        lhs: Id,
        rhs: Rc<Expr>,
        body: Rc<Expr>,
    },
    Letrec {
        lhs: Id,
        arg: Id,
        rhs: Rc<Expr>,
        body: Rc<Expr>,
    },
    And(Rc<Expr>, Rc<Expr>),
    Or(Rc<Expr>, Rc<Expr>),
}

pub enum Continuation {
    Halt,
    Rator {
        env: Env,
        rand: Rc<Expr>,
        k: Rc<Continuation>,
    },
    Rand {
        env: Env,
        rator: Rc<Value>,
        k: Rc<Continuation>,
    },
    Let {
        env: Env,
        id: Id,
        body: Rc<Expr>,
        k: Rc<Continuation>,
    },
    And {
        env: Env,
        arg: Rc<Expr>,
        k: Rc<Continuation>,
    },
    Or {
        env: Env,
        arg: Rc<Expr>,
        k: Rc<Continuation>,
    },
}

pub struct Env(Rc<PEnv>);

impl Clone for Env {
    fn clone(&self) -> Self {
        Env(Rc::clone(&self.0))
    }
}

enum PEnv {
    Empty,
    Rib(Id, EnvValue, Rc<PEnv>),
}

enum EnvValue {
    Raw(Rc<Value>),
    RecFun {
        env: Weak<PEnv>,
        arg: Id,
        body: Rc<Expr>,
    },
}

// Return value bound to `id` in `env`; returns None if binding not found.
pub fn lookup(env: Env, id: &Id) -> Option<Rc<Value>> {
    lookup_private(env.0, id)
}

// Variant of `lookup` that works on the private data type.
fn lookup_private(env: Rc<PEnv>, id: &Id) -> Option<Rc<Value>> {
    let env: &PEnv = &env;
    match env {
        PEnv::Empty => None,
        PEnv::Rib(rib_id, EnvValue::Raw(val), _) if id == rib_id => Some(Rc::clone(val)),
        PEnv::Rib(rib_id, EnvValue::RecFun { env, arg, body }, _) if id == rib_id => {
            match env.upgrade() {
                None => panic!("unable to upgrade RecFun's environment"),
                Some(e) => Some(Rc::new(Value::Closure(
                    Env(e),
                    arg.clone(),
                    Rc::clone(body),
                ))),
            }
        }
        PEnv::Rib(_, _, e) => lookup_private(Rc::clone(e), id),
    }
}

// Extends `env` with a binding for `id` to a non-recursive function value.
pub fn extend(env: Env, id: Id, value: Rc<Value>) -> Env {
    Env(Rc::new(PEnv::Rib(id, EnvValue::Raw(value), env.0.clone())))
}

// Extends `env` with a binding for `id` to a recursive function with argument `arg`
// and body `body`.
pub fn extend_rec(env: Env, id: Id, arg: Id, body: Rc<Expr>) -> Env {
    Env(Rc::new_cyclic(|new_env| {
        PEnv::Rib(
            id,
            EnvValue::RecFun {
                env: new_env.clone(),
                arg,
                body,
            },
            env.0.clone(),
        )
    }))
}
