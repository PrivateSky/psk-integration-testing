const tir = require('../test-util/tir.js');
const assert = require('double-check').assert;
const fs = require('fs');

const args = process.argv.slice(2);

const intervalSize = 6000;
const noOfDomains = args[0] || 1;
const domainThrowingErrorIndex = args[1] || 300;
const noOfAgentsPerDomain = 1;

const domainNameBase = 'pskDomain';
const agentNameBase = 'pskAgent';

var deployedDomains = 0;
const swarms = {
  commTest: {
    default: function(input, domainConfig) {
      console.log(`Default function`);
      const path = require('path');
      const interact = require('interact');
      var returnChannel = path.join(
        domainConfig.outbound,
        Math.random()
          .toString(36)
          .substr(2, 9)
      );
      interact
        .createNodeInteractionSpace('pskAgent_0', domainConfig.inbound, returnChannel)
        .startSwarm('commTest', 'extension', 0)
        .onReturn(result => {
          console.log(`FROM INTERACTION SPACEEEE ${result} `);
          this.return(result);
        });
    },
    extension: function(input) {
      if (input == '#1') {
        throw new Error('Intended error');
      } else {
        input += 1;
        console.log(`GOT RESULT FROM PHASE CALL ${input}`);
        this.return(input);
      }
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
  `Swarmurile  din agentii a ${noOfDomains} domenii separate pot fi apelate.`,
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
      let domainConfiguration = tir.getDomainConfig('pskDomain_1');
      setInterval(() => {
        console.log(
          `swarmcounter:${swarmCounter}  communicationsTested:${communicationsTested}  noOfDomains:${noOfDomains}`
        );

        if (communicationsTested == noOfDomains) {
          assert.true(communicationsTested == noOfDomains - 1, `Nu toti agentii au comunicat`);
          finished();
          tir.tearDown(0);
        }
      }, 500);
      interactions[0][0]
        .startSwarm('commTest', 'default', 1, domainConfiguration)
        .onReturn(result => {
          getResult();
          if (result == 1) {
            communicationsTested += 1;
          }
        });
    });
  },
  intervalSize + intervalSize * 0.4
);
