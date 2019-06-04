const tir = require('../test-util/tir.js');
const assert = require('double-check').assert;

const domainOne = 'local';
const domainTwo = 'second';

const agentOne = 'exampleAgent';
const agentTwo = 'secondAgent';
const agents = [agentOne, agentTwo];

const swarm = {
    echo: {
        say: function(input) {
            this.return('Echo ' + input);
        }
    }
};
const path = require("path");

assert.callback('2 domains local interact testing', (finished) => {
    tir.addDomain(domainOne, agents, swarm);
    tir.addDomain(domainTwo, agents, swarm);

    tir.launch(5000, () => {
        tir.interact(domainTwo, agentOne).startSwarm("echo", "say", "Hello").onReturn(result => {
            assert.equal("Echo Hello", result);

            //second interact on the same domain with different agent
            tir.interact(domainTwo, agentTwo).startSwarm("echo", "say", "Hello").onReturn(result => {
                assert.equal("Echo Hello", result);

                finished();
                tir.tearDown(0);
            });
        });
    });
}, 3500);
