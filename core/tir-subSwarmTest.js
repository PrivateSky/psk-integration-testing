const tir = require('../test-util/tir.js');
require("callflow");
require("launcher");
var assert = require("double-check").assert;

const domain = 'local';
const agents = ['agent'];

const swarms = { 
    subSwarm : {
        public:{
            value:"int"
        },
        doSomething: function(v1, v2){
            this.value = v1 * v2;
            this.return(v1 + v2);
        },
        getValue: function() {
            this.return (this.value);
        }
    },
    simpleSwarm : {
        begin: function(a1,a2, domainConfig){
            console.log(a1);
            this.domainConfig = domainConfig;
            const interact = require("interact");
            this.interaction = interact.createNodeInteractionSpace(
                'agent',
                domainConfig.inbound,
                domainConfig.outbound
            );
            // $$.swarm.start("subSwarm", "doSomething", a1, a2).onReturn(this.afterExecution);
            this.interaction.startSwarm('subSwarm', 'doSomething', a1,a2).onReturn( (result) => {
                this.afterExecution(result);
                this.return(0);
            });
        },
        afterExecution: function( res ){
            const assert = require("double-check").assert;
            const interact = require("interact");
            // var newSwarm = $$.swarm.restart("subSwarm", wholeSwarm);
            // assert.equal(newSwarm.value,2,"Subswarm's internal value is wrong");
            //^ doesn't work
            assert.equal(res, 3, "Value returned by subswarm function 'doSomething' is wrong!");
        }
    }
};

assert.callback("Subswarm test", function (finished) {
    tir.addDomain(domain,agents,swarms).launch(5000, () => {
        tir.interact(domain,agents[0]).startSwarm("simpleSwarm","begin",1,2, tir.getDomainConfig(domain)).onReturn(result => {
            finished();
            tir.tearDown(0);
        });
    })
},5000);