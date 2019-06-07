const tir = require('../test-util/tir.js');
const assert = require('double-check').assert;
const fs = require('fs');

const args = process.argv.slice(2);
const intervalSize = 6000;
const noOfDomains = 1;
const noOfAgentsPerDomain = args[0] || 2;
const agentThrowingErrorIndex = args[1] || 300;

const domainNameBase = 'pskDomain';
const agentNameBase = 'pskAgent';

var deployedDomains = 0;
const swarms = {
  commTest: {
    default: function(agentName, input) {
      console.log(`Default function, agent: next up extension call from ${agentName}`);
      input += 1;
      let currentAgent = this.getMetadata('target');
      this.swarm(agentName, 'extension', input, currentAgent);
    },
    extension: function(input, nextAgent) {
      const assert = require('double-check').assert;
      input += 1;
      assert.equal(input, 2, 'Something went wrong');
      this.swarm(nextAgent, 'end', input);
    },
    end: function(input) {
      const assert = require('double-check').assert;
      input += 1;
      assert.equal(input, 3, 'Something went wrong');
      this.return(input);
    }
  }
};

// ----------------- domand and agents setup ------------------------

function constructDomainName(sufix) {
  return `${domainNameBase}_${sufix}`;
}

function constructAgentName(sufix) {
  return `${agentNameBase}_${sufix}`;
}

function setupDomain(noOfAgents) {
  var agents = [];
  interactions[deployedDomains] = [];

  while (noOfAgents > 0) {
    noOfAgents--;
    agents.push(constructAgentName(agents.length));
  }

  tir.addDomain(constructDomainName(deployedDomains), agents, swarms);
  deployedDomains++;
}

function setupInteractions(domainIndex, noOfAgents) {
  for (let i = 0; i < noOfAgents; i++) {
    interactions[domainIndex].push(
      tir.interact(constructDomainName(domainIndex), constructAgentName(i))
    );
  }
}

let interactions = {};

for (let i = 0; i < noOfDomains; i++) {
  setupDomain(noOfAgentsPerDomain);
}
// ----------------- domain and agents setup ------------------------
assert.callback(
  `${noOfAgentsPerDomain} agenti pot comunica in mod succesiv in interiorul unui domeniu.(A0-A1-A0->result)`,
  finished => {
    tir.launch(
      intervalSize + intervalSize * 0.3,
      () => {
        var communicationWorking = 0;
        var swarmCounter = 0;
        function getResult() {
          swarmCounter++;
        }
        for (let d = 0; d < deployedDomains; d++) {
          setupInteractions(d, noOfAgentsPerDomain);
        }
        setInterval(() => {
          console.log(`communicationWorking ${communicationWorking} swarms:${swarmCounter}`);
          if (communicationWorking == noOfAgentsPerDomain - 1) {
            console.log(`SWARMS STARTED ${swarmCounter}`);
            assert.true(
              communicationWorking == noOfAgentsPerDomain - 1,
              `Au aparut probleme in comunicare!`
            );
            finished();
            tir.tearDown(0);
          }
        }, 500);
        interactions[0][0].startSwarm('commTest', 'default', 'pskAgent_1', 0).onReturn(result => {
          getResult();
          if (result == 3) {
            communicationWorking += 1;
          }
        });
      },
      intervalSize + intervalSize * 0.4
    );
  },
  3000
);
