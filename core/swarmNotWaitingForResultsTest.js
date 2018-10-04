require("../../../builds/devel/pskruntime");
require("callflow");
require("launcher");
var assert = require("double-check").assert;

var f = $$.swarms.describe("simpleSwarm", {
    type:"flow",       // flow, key, contract
    private:{
        a1: {
            type:"int",
            securityContext:"system"
        },
        a2:"int"
    },
    public:{
        result:"int"
    },
    begin:function(a1,a2,callback){
        this.a1 = a1;
        this.a2 = a2;
        this.callback=callback;
        try {
            this.swarm("agent", "doStep", 3);
        }catch(err){
            console.error(err);
        }
    },
    doStep:function(a){
        this.result = this.a1 + this.a2 + a;
        try {
            this.return(null, this.result);
        }catch(err){
            console.error(err);
        }
    },
    afterExecution: function(err, res, wholeSwarm){
        this.callback();
    }
})();

assert.callback("SwarmNotWaitingForResults",function(callback){
  f.begin(1,2,callback);
})
