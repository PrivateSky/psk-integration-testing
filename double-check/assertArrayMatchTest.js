require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
var positiveTestDataArray = [["",{},[1,[2,3]]], ["",{},[1,[2,3]]],["dd",null],["dd",null], ["1","dd",null,"aa","SF"], ["1","dd",null,"aa","SF"], [true, false, -0, NaN], [true, false, -0, NaN], [{1:1}],[{1:1}]];
var f = $$.flow.create("assertArrayMatchTest",{
    action:function(cb){
        this.cb = cb;
        for (var i = 0; i < positiveTestDataArray.length; i++) {
            var j = i + 1;
            assert.arraysMatch(positiveTestDataArray[i], positiveTestDataArray[j],'Arrays at index '+  i +' and '+j+' did not match');
            i+=1;
        };
        this.cb();
    }
});
assert.callback("assertArrayMatchTest", function(cb){
    f.action(cb);
}, 1500);

