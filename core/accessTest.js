const tir = require('./../../../psknode/tests/util/tir');
const assert = require('double-check').assert;
const domain = 'local';
const agents = ['exampleAgent', 'agent'];

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
            const assert = require('double-check').assert;
            this.prot_count += value; //undefined + number = NaN
            assert.notEqual(this.prot_count, NaN, "Error expected");            
            this.return(0);
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
