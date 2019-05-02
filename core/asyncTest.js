const tir = require('./../test-util/tir.js');
const assert = require('double-check').assert;
const domain = 'local';
const agents = ['exampleAgent'];

const swarms = {
    asyncExample:{
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
                        console.log(this.a1, this.a2);
                        setTimeout(this.doStep, 1);
                    },
                    doStep:function(){
                        const assert = require("double-check").assert;
                        this.result = this.a1 + this.a2;
                        console.log(this.result);
                        assert.equal(this.result, 3, "Results don't match");
                        this.return();
                    }
                }
        };

assert.callback('Access test', (finished) => {
        tir.addDomain(domain, agents, swarms).launch(5000, () => {
        tir.interact('local', 'exampleAgent').startSwarm("asyncExample", "begin", 1, 2).onReturn(result => {
                finished();
                tir.tearDown(0);
            });
    });
}, 3500);