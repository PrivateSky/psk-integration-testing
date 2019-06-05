const tir = require('../test-util/tir.js');
const assert = require('double-check').assert;
const fs = require('fs');

const intervalSize = 6000;
const noOfDomains = 10;
const noOfAgentsPerDomain = 1;

const domainNameBase = 'pskDomain';
const agentNameBase = 'pskAgent';

var deployedDomains = 0;
const swarms = {
  echo: {
    say: function(input) {
      console.log(`YELLL ${input}`);
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
// ----------------- domand and agents setup ------------------------
assert.callback(
  `Agentii pot comunica din domenii separate.`,
  finished => {
    tir.launch(intervalSize + intervalSize * 0.3, () => {
      var communicationsTested = 0;

      for (let d = 0; d < deployedDomains; d++) {
        setupInteractions(d, noOfAgentsPerDomain);
      }
      for (let i = 0; i < deployedDomains - 1; i++) {
        setTimeout(() => {
          console.log(
            `Test communication between pskAgents from pskDomain_${i} and pskDomain_${i + 1}`
          );
          interactions[i][0].startSwarm('echo', 'say', 0).onReturn(result => {
            interactions[i + 1][0].startSwarm('echo', 'say', result).onReturn(result1 => {
              if (result1 == 2) {
                communicationsTested += 1;
              }
              if (i == deployedDomains - 2) {
                assert.true(communicationsTested == noOfDomains - 1, `Agentii au comunicat!`);
                finished();
                tir.tearDown(0);
              }
            });
          });
        }, 0);
      }
    });
  },
  intervalSize + intervalSize * 0.4
);
