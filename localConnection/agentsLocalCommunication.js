const tir = require('./../test-util/tir.js');
const assert = require('double-check').assert;
const fs = require('fs');

const intervalSize = 6000;
const noOfDomains = 1;
const noOfAgentsPerDomain = 2;

const domainNameBase = 'pskDomain';
const agentNameBase = 'pskAgent';

var deployedDomains = 0;
const swarms = {
  echo: {
    say: function(input) {
      this.return(Number(input) + 1);
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
assert.callback(
  `Doi agenti pot comunica in interiorul aceluiasi domain.`,
  finished => {
    tir.launch(intervalSize + intervalSize * 0.3, () => {
      var passedVariable = 0;

      for (let d = 0; d < deployedDomains; d++) {
        setupInteractions(d, noOfAgentsPerDomain);
      }

      var interactAgent1 = interactions[0][0];
      var interactAgent2 = interactions[0][1];
      setTimeout(() => {
        console.log('Swarm Started');
        interactAgent1.startSwarm('echo', 'say', passedVariable).onReturn(result => {
          interactAgent2.startSwarm('echo', 'say', result).onReturn(result => {
            passedVariable = result;
            assert.true(passedVariable == noOfAgentsPerDomain, `Agentii au comunicat!`);
            finished();
            tir.tearDown(0);
          });
        });
      }, 0);
    });
  },
  intervalSize + intervalSize * 0.4
);
