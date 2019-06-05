const tir = require('../test-util/tir.js');
require("callflow");
const assert = require("double-check").assert;

const domain = 'local';
const agents = ['agent'];

const swarm = {
    stepExample :{
        private:{
            a1:"int",
            a2:"int"
        },
        public:{
            result:"int"
        },
        begin:function(a1,a2){
            this.a1 = a1;
            this.a2 = a2;
            console.log(a1);
            this.doStep(3);
            this.return(0);
        },
        doStep:function(a){
            this.result = this.a1 + this.a2 + a;
            this.doResult();
        },
        doResult:function(){
            const assert = require('double-check').assert;
            assert.equal(this.result,6,"Results don't match");
        }
    }
};

assert.callback("Step test",function (finish) {
    tir.addDomain(domain, agents, swarm).launch(5000, () => {
        tir.interact (domain, agents[0]).startSwarm("stepExample", "begin",1, 2).onReturn(() =>{
            finish();
            tir.tearDown(0);
        });
    })  
}, 3000)

