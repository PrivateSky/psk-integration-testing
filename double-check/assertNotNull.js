require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
var f = $$.flow.create("assertNotNull",{
    action:function(cb){
        this.cb = cb;
        this.dataArray = [{}, function(){}, true, false, "null" ];
        this.dataArray.forEach(function(element) {
            assert.notNull(element)
        });
        this.cb();
    }
});
assert.callback("assertNotNull", function(cb){
    f.action(cb);
}, 1500);
