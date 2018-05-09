require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
var f = $$.flow.create("equalPrimitiveNegativeTest",{

    action:function(cb){

        this.cb = cb;
        this.compareDataPrim = [true, false, null, NaN, undefined, 1, 1.3, "12",true, false, null, NaN, undefined, 1, 1.3, "12"];
        this.len = this.compareDataPrim.length -1;
        for(var i = 0; i < this.compareDataPrim.length/2; i++){
            assert.notEqual(this.compareDataPrim[i], this.compareDataPrim[this.len]);
            while(this.len > 7) {
                this.len--;
            }
        }
        this.cb();
    },

});
assert.callback("equalPrimitiveNegativeTest", function(cb){
    f.action(cb);
}, 1500);


var f1 = $$.flow.create("equalNonPrimitiveNegativeTest",{

    action:function(cb){

        this.cb = cb;
        this.compareDataPrim = [[1,2,3], {1:3}, new String('foo'), new String('foo') ];
        this.data = [[1,2,3], {1:3}, new String('foo'), new String('foo') ];
        for(var i = 0; i < this.compareDataPrim.length; i++){
            assert.notEqual(this.compareDataPrim[i], this.data[i]);
        }
        this.cb();
    },

});
assert.callback("equalNonPrimitiveNegativeTest", function(cb){
    f1.action(cb);
}, 1500);

