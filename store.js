"use strict";

/***********************************************************************************
 * 
 * Exports:
 *   mkBaseStore: [a] -> [Store<a>, [Address]]
 *   alloc: a Store<a> -> [Store<a>, Address]
 * 
 * Store<a> Properties:
 *   deref: Address -> a    throws exn if Address not allocated
 *   update: Address a -> Store<a>   throws exn if Address not allocated
 ***********************************************************************************/

function mkAddr(n) {
    return { 
        n: n,
        toString: function toString() { return "Addr(" + n + ")"; }
    };
}

function mkBaseStore(values) {
    return [
        {
            nextAddress: values.length,
            values: values,
            deref: function deref(addr) {
                if (0 < addr.n && addr.n < values.length) {
                    return values[addr.n];
                } else {
                    throw new Error("address " + addr.toString() + " not allocated");
                }
            },
            toString: function toString() { return "base store"; }
        },
        values.map((val, index) => mkAddr(index))
    ];
}

exports.mkBaseStore = mkBaseStore;

function alloc(values, st) {
    if (values.length === 0) {
        return [st, []];
    } else {
        // address of first value allocated in this rib
        let baseAddress = st.nextAddress.n;
        return [
            {
                nextAddress: mkAddr(st.nextAddress.n + values.length),
                deref: function deref(addr) {
                    let shiftedAddr = addr.n - baseAddress;
                    if (shiftedAddr < 0) { 
                        return st.deref(addr);
                    } else if (shiftedAddr < values.length) {
                        return values[shiftedAddr];
                    } else {
                        throw new Error("address " + addr.toString() + " not allocated");
                    }
                },
                toString: function toString() { 
                    let valStrs = values.map((val, index) => index.toString() + ": " + val.toString());
                    return "Store(nextAddress: " + this.nextAddress.toString() 
                        + ", values: [" + valStrs.join(", ") + "], next: " + st.toString() + ")";
                }
            },
            values.map((val, index) => mkAddr(baseAddress + index))
        ];
    }
}

exports.alloc = alloc;