const tir = require('./../test-util/tir.js');
const assert = require('double-check').assert;
const domain = 'local';
const agents = ['exampleAgent'];

const swarms = {
    simpleSwarm: {
        local:{
            prot_count:"int"
        },
        public:{
            pub_count:"int"
        },
        begin:function(){
            this.prot_count = 3;
            this.swarm("agent", "doStep", 3);
        },
        doStep:function (value) {
            try {
                this.prot_count += value;
            }catch(err){
                console.log(err);
                assert.notEqual(err,null,"Error expected");
            }
        }
    }
};


assert.callback('Access test', (finished) => {
    tir.addDomain(domain, agents, swarms).launch(5000, () => {
        tir.interact('local', 'exampleAgent').startSwarm("simpleSwarm", "begin").onReturn(result => {
            finished();
            tir.tearDown(0);
        });
    });
}, 3500);
