// require("../../../builds/devel/pskruntime");
const tir = require('../test-util/tir.js')
require("callflow");
require("launcher");
const assert = require("double-check").assert;

const domain = 'local';
const agents = ['agent0', 'agent1'];

const swarm = { 
    multiContextsSwarm: {
        // type:"flow",       // flow, key, contract
        public:{
            a1:"int",
            a2:"int",
            result:"int"
        },
        begin:function(a1,a2){
            this.a1 = a1;
            this.a2 = a2;
            this.swarm('agent0', "doStepOne", 3).onReturn(this.afterExecution);
        },
        doStepOne:function(a){    
            const assert = require('double-check').assert;
            this.result = this.a1 + this.a2 + a;
            assert.notEqual(this.result,null,"this.result is not a number");
            this.swarm("agent1", "doStepTwo",3 ).onReturn(this.afterStepTwo);
            return(null,this.result);
        },
        doStepTwo:function (value) {            
            this.result += value;
            return(null,this.result);
    
        },
        afterStepTwo:function(err,res,wholeSwarm){                        
            const assert = require('double-check').assert;            
            assert.equal(err,null,"Error");
            assert.equal(this.result,undefined,"this.result should be undefined");
            assert.equal(res,6,"Invalid value of res");
            this.update(wholeSwarm);
            assert.equal(this.result,6,"this.result should be 6 after update");
            console.log("After Execution",res);
            return(null,this.result);
        },
        afterExecution: function(err,res,wholeSwarm){                        
            const assert = require('double-check').assert;            
            assert.equal(err,null,"Error");
            assert.equal(this.result,undefined,"this.result should be undefined");
            assert.equal(res,9,"Invalid value of res");
            this.update(wholeSwarm);
            assert.equal(this.result,9,"this.result should be 6 after update");
            console.log("After Execution",res);
            this.return(0);
        }
    }
};

assert.callback("MultiContexts test",function(finished){
    tir.addDomain(domain, agents, swarm).launch( 500000 ,() => {
        tir.interact(domain, agents[0]).startSwarm("multiContextsSwarm", "begin", [1,2,assert,finished]).onReturn((result) => {
            console.log("RETURNED");
            finished();
            tir.tearDown(0);
        });
    })
},50000)
