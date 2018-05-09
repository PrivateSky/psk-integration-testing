require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
var f = $$.flow.create("assertNullTest",{
    action:function(cb){
        this.cb = cb;
        this.dataArray = [ null ,(function(){})(), function(){}, {} , undefined, true, false, "null" ];
        this.dataArray.forEach(function(element) {
            assert.isNull(element, element + " is not null");
        })
    }
});
assert.callback("assertNullTest", function(cb){
    f.action(cb);
}, 1500);

