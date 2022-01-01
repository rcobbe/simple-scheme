#![allow(unused_variables)]
#![allow(dead_code)]

use crate::types::{Continuation, Env, Expr, Primitive, Value};
use std::rc::Rc;

struct ExprConfig {
    expr: Rc<Expr>,
    env: Env,
    k: Rc<Continuation>,
}

struct ValueConfig {
    value: Rc<Value>,
    k: Rc<Continuation>,
}

enum Config {
    Expr(ExprConfig),
    Value(ValueConfig),
}

fn value_step(vc: ValueConfig) -> Config {
    let ValueConfig { value, k } = vc;
    match &*k {
        Continuation::Halt => Config::Value(ValueConfig { value, k }),
        Continuation::Rator { env, rand, k } => Config::Expr(ExprConfig {
            expr: Rc::clone(rand),
            env: env.clone(),
            k: Rc::clone(k),
        }),
        Continuation::Rand { env, rator, k } => apply(Rc::clone(rator), value, Rc::clone(k)),
        Continuation::Let { env, id, body, k } => Config::Expr(ExprConfig {
            expr: Rc::clone(body),
            env: Env::extend(id.clone(), value, env),
            k: Rc::clone(k),
        }),
        Continuation::And { env, arg, k } => match &*value {
            Value::False => Config::Value(ValueConfig {
                value: Rc::new(Value::False),
                k: Rc::clone(k),
            }),
            _ => Config::Expr(ExprConfig {
                expr: Rc::clone(arg),
                env: env.clone(),
                k: Rc::clone(k),
            }),
        },
        Continuation::Or { env, arg, k } => match &*value {
            Value::False => Config::Expr(ExprConfig {
                expr: Rc::clone(arg),
                env: env.clone(),
                k: Rc::clone(k),
            }),
            _ => Config::Value(ValueConfig {
                value,
                k: Rc::clone(k),
            }),
        },
    }
}

fn apply(rator: Rc<Value>, rand: Rc<Value>, k: Rc<Continuation>) -> Config {
    match (&*rator, &*rand) {
        (Value::Closure(env, id, body), _) => Config::Expr(ExprConfig {
            expr: Rc::clone(body),
            env: Env::extend(id.clone(), Rc::clone(&rand), env),
            k,
        }),
        (Value::Prim(Primitive::Add), Value::Int(n)) => Config::Value(ValueConfig {
            value: Rc::new(Value::Prim(Primitive::AddArg(*n))),
            k,
        }),
        (Value::Prim(Primitive::AddArg(n)), Value::Int(m)) => Config::Value(ValueConfig {
            value: Rc::new(Value::Int(n + m)),
            k,
        }),
        (Value::Prim(Primitive::Sub), Value::Int(n)) => Config::Value(ValueConfig {
            value: Rc::new(Value::Prim(Primitive::AddArg(*n))),
            k,
        }),
        (Value::Prim(Primitive::SubArg(n)), Value::Int(m)) => Config::Value(ValueConfig {
            value: Rc::new(Value::Int(n - m)),
            k,
        }),
        (Value::Prim(Primitive::Equal), Value::Int(n)) => Config::Value(ValueConfig {
            value: Rc::new(Value::Prim(Primitive::EqualArg(*n))),
            k,
        }),
        (Value::Prim(Primitive::EqualArg(n)), Value::Int(m)) => Config::Value(ValueConfig {
            value: Rc::new(if n == m { Value::True } else { Value::False }),
            k,
        }),
        (Value::Prim(Primitive::NullP), arg) => Config::Value(ValueConfig {
            value: Rc::new(match arg {
                Value::Null => Value::True,
                _ => Value::False,
            }),
            k,
        }),
        (Value::Prim(Primitive::Cons), _) => Config::Value(ValueConfig {
            value: Rc::new(Value::Prim(Primitive::ConsArg(Rc::clone(&rand)))),
            k,
        }),
        (Value::Prim(Primitive::ConsArg(left)), _) => Config::Value(ValueConfig {
            value: Rc::new(Value::Pair(Rc::clone(left), Rc::clone(&rand))),
            k,
        }),
        (Value::Prim(Primitive::Car), Value::Pair(car, _)) => Config::Value(ValueConfig {
            value: Rc::clone(car),
            k,
        }),
        (Value::Prim(Primitive::Cdr), Value::Pair(_, cdr)) => Config::Value(ValueConfig {
            value: Rc::clone(cdr),
            k,
        }),
        _ => panic!("illegal application"),
    }
}
