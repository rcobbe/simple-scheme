#![allow(dead_code)]

use std::cell::RefCell;
use std::rc::{Rc, Weak};

#[derive(PartialEq, Eq, Clone)]
pub struct Id(String);

impl Id {
    pub fn new(s: &str) -> Id {
        Id(s.to_string())
    }
}

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

#[derive(PartialEq)]
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

trait PtrEq {
    // associated function so we can implement this trait for Rc<T>
    fn ptr_eq(lhs: &Self, rhs: &Self) -> bool;
}

impl<T> PtrEq for Rc<T> {
    fn ptr_eq(lhs: &Rc<T>, rhs: &Rc<T>) -> bool {
        Rc::as_ptr(lhs) == Rc::as_ptr(rhs)
    }
}

pub struct Env(Rc<PEnv>);

impl PtrEq for Env {
    fn ptr_eq(lhs: &Env, rhs: &Env) -> bool {
        PtrEq::ptr_eq(&lhs.0, &rhs.0)
    }
}

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
        env: RefCell<Weak<PEnv>>,
        arg: Id,
        body: Rc<Expr>,
    },
}

impl Env {
    pub fn empty() -> Env {
        Env(Rc::new(PEnv::Empty))
    }

    // Return value bound to `id` in `self`; returns None if binding not found.
    pub fn lookup(&self, id: &Id) -> Option<Rc<Value>> {
        Env::lookup_private(self.0.clone(), id)
    }

    // Variant of `lookup` that works on the private data type.
    fn lookup_private(env: Rc<PEnv>, id: &Id) -> Option<Rc<Value>> {
        let env: &PEnv = &env;
        match env {
            PEnv::Empty => None,
            PEnv::Rib(rib_id, EnvValue::Raw(val), _) if id == rib_id => Some(Rc::clone(val)),
            PEnv::Rib(rib_id, EnvValue::RecFun { env, arg, body }, _) if id == rib_id => {
                match env.borrow().upgrade() {
                    None => panic!("unable to upgrade RecFun's environment"),
                    Some(e) => Some(Rc::new(Value::Closure(
                        Env(e),
                        arg.clone(),
                        Rc::clone(body),
                    ))),
                }
            }
            PEnv::Rib(_, _, e) => Env::lookup_private(Rc::clone(e), id),
        }
    }

    // Extends `env` with a binding for `id` to a non-recursive function value.
    // Associated function because calls flow better when the environment to be extended
    // is the last argument, similar to cons.
    pub fn extend(id: Id, value: Rc<Value>, env: &Env) -> Env {
        Env(Rc::new(PEnv::Rib(id, EnvValue::Raw(value), env.0.clone())))
    }

    // Extends `env` with a binding for `id` to a recursive function with argument `arg`
    // and body `body`.
    pub fn extend_rec(id: Id, arg: Id, body: Rc<Expr>, env: &Env) -> Env {
        let new_env = Rc::new(PEnv::Rib(
            id,
            EnvValue::RecFun {
                env: RefCell::new(Weak::new()),
                arg,
                body,
            },
            env.0.clone(),
        ));
        match &*new_env {
            PEnv::Rib(_, EnvValue::RecFun { env: env_ptr, .. }, _) => {
                env_ptr.replace(Rc::downgrade(&new_env));
                Env(new_env)
            }
            _ => panic!("bad env"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lookup_in_empty() {
        assert!(Env::empty().lookup(&Id::new("x")).is_none())
    }

    #[test]
    fn lookup_simple() {
        let val = Rc::new(Value::Int(3));
        let env = Env::extend(Id::new("x"), Rc::clone(&val), &Env::empty());
        assert!(match env.lookup(&Id::new("x")) {
            Some(v) => Rc::as_ptr(&v) == Rc::as_ptr(&val),
            _ => false,
        })
    }

    #[test]
    fn lookup_rec() {
        let id = Id::new("f");
        let arg = Id::new("x");
        let body = Rc::new(Expr::App {
            rator: Rc::new(Expr::Id(id.clone())),
            rand: Rc::new(Expr::Id(arg.clone())),
        });
        let env = Env::extend_rec(id.clone(), arg.clone(), Rc::clone(&body), &Env::empty());
        assert!(match env.lookup(&id) {
            None => false,
            Some(v) => {
                match &*v {
                    Value::Closure(value_env, value_arg, value_body) => {
                        PtrEq::ptr_eq(&env, &value_env)
                            && &arg == value_arg
                            && PtrEq::ptr_eq(&body, value_body)
                    }
                    _ => false,
                }
            }
        })
    }
}
