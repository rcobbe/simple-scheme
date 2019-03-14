"use strict";

/* Is a property with a getter but no setter functionally read-only?
 *
 * Yes.
 */

var obj = {
    get prop() { return 42; }
};

console.log(obj.prop);
obj.prop = 45;
console.log(obj.prop);

