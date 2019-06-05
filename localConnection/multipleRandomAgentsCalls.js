const tir = require('../test-util/tir.js');
const assert = require('double-check').assert;
const fs = require('fs');

const args = process.argv.slice(2);
const intervalSize = 10000;
const noOfDomains = 1;
const noOfAgentsPerDomain = args[0] || 2;
const agentThrowingErrorIndex = args[1] || 300;
const numberOfInteractions = args[2] || noOfAgentsPerDomain;

const domainNameBase = 'pskDomain';
const agentNameBase = 'pskAgent';

var deployedDomains = 0;

const swarms = {
  echo: {
    say: function(input) {
      console.log(`YELL ${input}`);
      this.return(Number(input) + 1);
    },
    throwError: function() {
      throw new Error('this is a generated error for testing purpose');
    }
  }
};

// ----------------- domain and agents setup ------------------------

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
  `Call-uri random intre agentii aceluiasi domeniu`,
  finished => {
    tir.launch(intervalSize + intervalSize * 0.3, () => {
      var communicationWorking = 0;
      var swarmCounter = 0;
      function getResult() {
        swarmCounter++;
      }
      for (let d = 0; d < deployedDomains; d++) {
        setupInteractions(d, noOfAgentsPerDomain);
      }
      setInterval(() => {
        console.log(
          `Interval called swarmCounter:${swarmCounter} noOfAgentsPerDomain:${noOfAgentsPerDomain} communicationsWorking:${communicationWorking}`
        );
        if (communicationWorking == numberOfInteractions) {
          console.log(`SWARM COUNTER ${swarmCounter}`);
          assert.true(
            communicationWorking == numberOfInteractions,
            `Nu toti agentii au comunicat!`
          );
          finished();
          tir.tearDown(0);
        }
      }, 500);
      for (let i = 0; i < numberOfInteractions; i++) {
        let firstAgent = Math.floor(Math.random() * noOfAgentsPerDomain);
        let secondAgent = Math.floor(Math.random() * noOfAgentsPerDomain);
        while (firstAgent == secondAgent) {
          secondAgent = Math.floor(Math.random() * noOfAgentsPerDomain);
        }
        console.log(
          `Test communication between pskAgent_${firstAgent} and pskAgent_${secondAgent}`
        );
        interactions[0][firstAgent].startSwarm('echo', 'say', 0).onReturn(result => {
          getResult();
          if (secondAgent == agentThrowingErrorIndex) {
            interactions[0][secondAgent]
              .startSwarm('echo', 'throwError', result)
              .onReturn(result1 => {
                getResult();
              });
          } else {
            interactions[0][secondAgent].startSwarm('echo', 'say', result).onReturn(result1 => {
              getResult();
              if (result1 == 2) {
                communicationWorking += 1;
              }
            });
          }
        });
      }
    });
  },
  intervalSize + intervalSize * 0.4
);
