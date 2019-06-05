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
  `Se pot realiza call-uri succesive din agenti diferiti.`,
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
        if (communicationWorking == noOfAgentsPerDomain - 1) {
          console.log(`SWARMS STARTED ${swarmCounter}`);
          assert.true(
            communicationWorking == noOfAgentsPerDomain - 1,
            `Au aparut probleme in pornirea unui swarm!`
          );
          finished();
          tir.tearDown(0);
        }
      }, 500);
      for (let i = 0; i < interactions[0].length - 1; i++) {
        console.log(`Test communication between pskAgent_${i} and pskAgent_${i + 1}`);
        interactions[0][i].startSwarm('echo', 'say', 0).onReturn(result => {
          if (i + 1 == agentThrowingErrorIndex) {
            interactions[0][i + 1].startSwarm('echo', 'throwError', result).onReturn(result1 => {
              getResult();
            });
          } else {
            interactions[0][i + 1].startSwarm('echo', 'say', result).onReturn(result1 => {
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
