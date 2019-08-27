require("../../../psknode/bundles/pskruntime");
require("callflow");
require("launcher");
var assert = require("double-check").assert;

var f = $$.swarms.describe("simpleSwarm", {
    type:"flow",       // flow, key, contract
    public:{
        a1:"int",
        a2:"int",
        result:"int"
    },
    begin:function(a1,a2,callback){
        this.a1 = a1;
        this.a2 = a2;
        this.callback = callback;
        this.swarm('space1\\agent\\agent_007', "doStep", 3).onReturn(this.afterExecution);
    },
    doStep:function(a){
        this.result = this.a1 + this.a2 + a;
        this.return(null,this.result);
        //this.swarm("space1\\agent\\agent_008", "afterExecution",this.result );
    },
    afterExecution: function(err,res,wholeSwarm){
        assert.equal(err,null,"Error");
        assert.equal(this.result,undefined,"this.result should be undefined");
        assert.equal(res,6,"Invalid value of res");
        this.update(wholeSwarm);
        assert.equal(this.result,6,"this.result should be 6 after update");
        //console.log("After Execution",res);
        this.callback();
    }
})();
assert.callback("SwarmBasic test",function (callback) {
    f.begin(1,2,callback);
})