const tir = require('../test-util/tir.js');
const assert = require('double-check').assert;
const fs = require('fs');

const args = process.argv.slice(2);

const intervalSize = 6000;
const noOfDomains = args[0] || 10;
const domainThrowingErrorIndex = args[1] || 300;
const noOfAgentsPerDomain = 1;

const domainNameBase = 'pskDomain';
const agentNameBase = 'pskAgent';

var deployedDomains = 0;
const swarms = {
  echo: {
    say: function(input) {
      console.log(`YELL ${input}`);
      this.return(Number(input) + 1);
    },
    throwError: function(delay) {
      console.log('An test purpose error will be thrown in ', delay || 10, 'ms');
      setTimeout(() => {
        throw new Error('this is a generated error for testing purpose');
      }, delay || 10);
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
  `Swarmurile  din ${noOfDomains} domenii separate pot fi apelati.`,
  finished => {
    tir.launch(intervalSize + intervalSize * 0.3, () => {
      var communicationsTested = 0;
      var swarmCounter = 0;
      function getResult() {
        swarmCounter++;
      }

      for (let d = 0; d < deployedDomains; d++) {
        setupInteractions(d, noOfAgentsPerDomain);
      }
      setInterval(() => {
        console.log(
          `swarmcounter:${swarmCounter}  communicationsTested:${communicationsTested}  noOfDomains:${noOfDomains}`
        );

        if (communicationsTested == noOfDomains - 1) {
          assert.true(communicationsTested == noOfDomains - 1, `Nu toti agentii au comunicat`);
          finished();
          tir.tearDown(0);
        }
      }, 500);
      for (let i = 0; i < deployedDomains - 1; i++) {
        console.log(
          `Test communication between pskAgents from pskDomain_${i} and pskDomain_${i + 1}`
        );
        interactions[i][0].startSwarm('echo', 'say', 0).onReturn(result => {
          getResult();
          if (i + 1 == domainThrowingErrorIndex) {
            interactions[i + 1][0].startSwarm('echo', 'throwError', result).onReturn(result1 => {
              getResult();
            });
          } else {
            interactions[i + 1][0].startSwarm('echo', 'say', result).onReturn(result1 => {
              getResult();
              if (result1 == 2) {
                communicationsTested += 1;
              }
            });
          }
        });
      }
    });
  },
  intervalSize + intervalSize * 0.4
);
