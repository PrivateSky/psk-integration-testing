const tir = require('../test-util/tir.js');
const assert = require('double-check').assert;
const utils = require('./testUtils');

const args = process.argv.slice(2);
const intervalSize = 6000;
const noOfDomains = 1;
const noOfAgentsPerDomain = args[0] || 3;

const swarms = {
  commTest: {
    default: function(agentName, input) {
      console.log(`Default function`);
      input += 1;
      let currentAgent = this.getMetadata('target');
      this.swarm('pskAgent_' + input, 'extension', input, currentAgent);
    },
    extension: function(input) {
      console.log(`EXTENSION INPUT:${input}`);

      input += 1;
      if (input == 4) {
        this.swarm('pskAgent_0', 'end', input);
      } else if (input == 3) {
        this.swarm('pskAgent_1', 'extension', input);
      } else {
        this.swarm('pskAgent_' + input, 'extension', input);
      }
    },
    end: function(input) {
      const assert = require('double-check').assert;
      input += 1;
      assert.equal(input, 5, 'Something went wrong');
      this.return(input);
    }
  }
};

utils.initData(intervalSize, noOfDomains, noOfAgentsPerDomain, swarms);
var interactions = utils.interactions;

assert.callback(
  `${noOfAgentsPerDomain} agenti pot comunica in mod succesiv in interiorul unui domeniu.(A0-A1-A2-A1-A0->result)`,
  finished => {
    tir.launch(
      intervalSize + intervalSize * 0.3,
      () => {
        var communicationWorking = 0;
        var swarmCounter = 0;
        function getResult() {
          swarmCounter++;
        }
        for (let d = 0; d < utils.deployedDomains; d++) {
          utils.setupInteractions(d, noOfAgentsPerDomain);
        }
        setInterval(() => {
          console.log(`communicationWorking ${communicationWorking} swarms:${swarmCounter}`);
          if (communicationWorking == 1) {
            console.log(`SWARMS STARTED ${swarmCounter}`);
            assert.true(communicationWorking == 1, `Au aparut probleme in comunicare!`);
            finished();
            tir.tearDown(0);
          }
        }, 500);
        interactions[0][0].startSwarm('commTest', 'default', 'pskAgent_1', 0).onReturn(result => {
          getResult();
          if (result == 5) {
            communicationWorking += 1;
          }
        });
      },
      intervalSize + intervalSize * 0.4
    );
  },
  3000
);
