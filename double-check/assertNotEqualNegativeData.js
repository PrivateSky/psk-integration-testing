require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
var f = $$.flow.create("assertNotEqualNegativeDataTest",{
    action:function(cb) {
        this.cb = cb;
        this.valueArray1 = [-0, +0, +0, 0, 'foo', false, true, null, undefined];
        this.valueArray2 = [0, 0, -0, 0, 'foo', false, true, null, undefined];
        assert.true(this.valueArray1.length === this.valueArray2.length, "Array size should be the same for both arrays");
        for (var i = 0; i < this.valueArray1.length; i++) {
            assert.notEqual(this.valueArray1[i], this.valueArray2[i]);
        }
        this.cb();
    }
});
assert.callback("assertNotEqualNegativeDataTest", function(cb){
    f.action(cb);
}, 1500);