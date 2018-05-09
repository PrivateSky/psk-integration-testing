require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
var f = $$.flow.create("acceptedCallbackType",{

    action:function(cb){
       this.cb = cb;
       this.cb();
    },
});
var callbackType = [null, undefined, {}, "string", true, function (cb) {f.action(cb);}];
for (var i = 0; i < callbackType.length; i++) {
    assert.callback("acceptedCallbackType", callbackType[i], 1500);
};