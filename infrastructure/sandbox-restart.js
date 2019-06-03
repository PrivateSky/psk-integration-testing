const tir = require('../test-util/tir.js');
const assert = require('double-check').assert;
const domain = 'local';
const agentName = 'exampleAgent';
const agents = [agentName];

const swarm = {
  failing: {
    public: {
    },
    throwError: function(delay) {
      console.log("An test purpose error will be thrown in ", delay || 10, "ms");
      setTimeout(()=>{
        throw new Error("this is a generated error for testing purpose");
      }, delay || 10);
    }
  },
  working: {
    execute: function(ping){
      console.log("The good swarm was called with ping:", ping);
      this.return("Hello");
    }
  }
};


assert.callback('Sandbox crash and recovery test', (finished) => {
  tir.addDomain(domain, agents, swarm).launch(15000, () => {

    var interaction = tir.interact(domain, agentName);
    interaction.startSwarm("failing", "throwError");

    var ping = "Hello";
    setTimeout(()=>{
      interaction.startSwarm("working", "execute", ping).onReturn(result => {
          assert.true(ping, result);
          finished();
          tir.tearDown(0);
        });
    }, 1500);

  });
}, 10500);
