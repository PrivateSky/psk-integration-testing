require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
var negativeTestDataArray = [ [1,2,3,4,5], [6,7,6,6,6], ['1','2','3','4','5'], [1,2,3,4,5], [NaN, NaN], [NaN, NaN] ];
var f = $$.flow.create("assertArrayMatchTestNegative",{

    action:function(cb){
        this.cb = cb;
        for (var i = 0; i < negativeTestDataArray.length; i++) {
            var j = i + 1;
            assert.arraysMatch(negativeTestDataArray[i], negativeTestDataArray[j],'Arrays at index '+  i +' and '+j+' did not match');
            i+=1;
        };
        this.cb();
    },
});
assert.callback("assertArrayMatchTestNegative", function(cb){
    f.action(cb);
}, 1500);
