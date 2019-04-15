const tir = require('./../test-util/tir.js');
const assert = require('double-check').assert;
const domain = 'local';
const agentOne = 'exampleAgent';
const agentTwo = 'secondAgent';
const agents = [agentOne, agentTwo];

const swarm = {
  echo: {
    public: {
      prefix: { type: 'string', value: 'Echo' }
    },
    say: function(input) {
      this.return(this.prefix + ' ' + input);
    }
  }
};


assert.callback('Local connection testing', (finished) => {
  tir.addDomain(domain, agents, swarm).launch(5000, () => {

    tir.interact(domain, agentOne).startSwarm("echo", "say", "Hello").onReturn(result => {

      //second interact on the same domain with different agent
      tir.interact(domain, agentTwo).startSwarm("echo", "say", "Hello").onReturn(result => {
          //assert.equal("Echo Hello", result);
          finished();
          tir.tearDown(0);
      });
    });
  });
}, 3500);
