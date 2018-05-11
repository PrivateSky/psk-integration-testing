
require("../../engine/core").enableTesting();
var assert=require("double-check").assert;
var f = $$.flow.describe("FlowExample", {
    private:{
        a1:"int",
        a2:"int"
    },
    public:{
        result:"int"
    },
    begin:function(a1,a2){
        this.result = a1 + a2;
    }
})();

f.begin(1, 2);
assert.equal(f.result,3,"Results don't match");
