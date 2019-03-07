const tir = require('./tir');
const assert = require('double-check').assert;

const domain = 'local';
const agents = [];
const swarm = '../builds/devel/domain.js';

assert.callback('Local connection testing', (finished) => {
  tir.addDomain(domain, agents, swarm).launch(() => {
    tir.interact('local', 'exampleAgent').startSwarm("echo", "say", "Hello").onReturn(result => {
      assert.equal("Echo Hello", result);
      tir.tearDown();
      finished();
      process.exit(0);
    });
  });

}, 3500);
