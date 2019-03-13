const tir = require('./tir');
const assert = require('double-check').assert;

const domain = 'local';
const agents = ['exampleAgent'];

const swarm = {
  echo: {
    say: function(input) {
      this.return("Echo " + input);
    }
  },
  notifier: {
    init: function (encryptedSeed) {
      this.encryptedSeed = encryptedSeed;
    }
  }
};


assert.callback('Local connection testing', (finished) => {
  tir.addDomain(domain, agents, swarm).launch(5000, () => {
    tir.interact('local', 'exampleAgent').startSwarm("echo", "say", "Hello").onReturn(result => {
      assert.equal("Echo Hello", result);
      finished();
      tir.tearDown(0);
    });
  });
}, 3500);
