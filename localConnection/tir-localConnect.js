const tir = require('./tir');
const assert = require('double-check').assert;

const domain = 'local';
const agents = []; // ???
const swarm = '../builds/devel/domain.js';

assert.callback('Local connection testing', (finished) => {
  
  tir.launch(domain, agents, swarm, function() {
    
    tir.interact('local', 'exampleAgent').startSwarm("echo", "say", "Hello").onReturn(result => {
      assert.equal("Echo Hello", result);
      finished();
      tir.tearDown(0);
    });

  });

}, 3500);
