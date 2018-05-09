require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
var f = $$.flow.create("assertCallbackNoName",{
    action:function(cb){
        this.cb = cb;
        this.cb();
    }
});
assert.callback(function(cb){
    f.action(cb);
}, 1500);