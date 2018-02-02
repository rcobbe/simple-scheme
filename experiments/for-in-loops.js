var sym = Symbol("xyz");
var obj = {
    a: 3,
    b: 4,
    "c d": 5,
    [sym]: 6
};

for (let x in obj) {
    console.log(x, obj[x]);
}

// Note that we do *not* log obj[sym], as per the spec.  Even though symbol attributes may be enumerable,
// for..in always skips them.