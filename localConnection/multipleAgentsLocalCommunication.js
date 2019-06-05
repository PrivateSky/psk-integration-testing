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
      this.swarm(agentName, 'extension', input);
    },
    extension: function(input) {
      //console.log(`Extension call from ${agentName}`);
      if (input == '#1') {
        throw new Error('Intended error');
      } else {
        input += 1;
        this.return(input);
      }
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
  `${noOfAgentsPerDomain} agenti pot comunica in interiorul aceluiasi domain.`,
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
        for (let i = 0; i < interactions[0].length - 1; i++) {
          console.log(`Test communication between pskAgent_${i} and pskAgent_${i + 1}`);
          let nextAgent = 'pskAgent_' + (i + 1);
          if (i + 1 == agentThrowingErrorIndex) {
            interactions[0][i]
              .startSwarm('commTest', 'default', nextAgent, '#')
              .onReturn(result => {
                getResult();
                if (result == 2) {
                  communicationWorking += 1;
                }
              });
          } else {
            interactions[0][i].startSwarm('commTest', 'default', nextAgent, 0).onReturn(result => {
              getResult();
              if (result == 2) {
                communicationWorking += 1;
              }
            });
          }
        }
      },
      intervalSize + intervalSize * 0.4
    );
  },
  3000
);
