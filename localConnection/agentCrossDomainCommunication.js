const tir = require('../test-util/tir.js');
const assert = require('double-check').assert;
const fs = require('fs');

const args = process.argv.slice(2);

const intervalSize = 6000;
const noOfDomains = args[0] || 2;
const domainThrowingErrorIndex = args[1] || 300;
const noOfAgentsPerDomain = 1;
const noOfInteractionsTested = args[2] || noOfDomains;

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
      input += 1;
      interact
        .createNodeInteractionSpace('pskAgent_0', domainConfig.inbound, returnChannel)
        .startSwarm('commTest', 'extension', input)
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
  `Swarmurile  din agentii a ${noOfDomains} domenii separate pot fi apelate.(numar incercari:${noOfInteractionsTested})`,
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
          `swarmcounter:${swarmCounter}  communicationsTested:${communicationsTested} noOfInteractionsTested:${noOfInteractionsTested}  noOfDomains:${noOfDomains}`
        );

        if (communicationsTested - 1 == noOfInteractionsTested) {
          assert.true(
            communicationsTested - 1 == noOfInteractionsTested,
            `Nu toti agentii au comunicat`
          );
          finished();
          tir.tearDown(0);
        }
      }, 500);
      for (let i = 0; i <= noOfInteractionsTested; i++) {
        let firstDomain = Math.floor(Math.random() * noOfDomains);
        let secondDomain = Math.floor(Math.random() * noOfDomains);
        while (firstDomain == secondDomain) {
          secondDomain = Math.floor(Math.random() * noOfDomains);
        }
        let domainConfiguration = tir.getDomainConfig(`pskDomain_${secondDomain}`);
        console.log(`Communication between pskDomain_${firstDomain} and pskDomain${secondDomain}`);
        if (firstDomain == domainThrowingErrorIndex) {
          interactions[firstDomain][0]
            .startSwarm('commTest', 'default', '#', domainConfiguration)
            .onReturn(result => {
              getResult();
              if (result == 2) {
                communicationsTested += 1;
              }
            });
        } else {
          interactions[firstDomain][0]
            .startSwarm('commTest', 'default', 0, domainConfiguration)
            .onReturn(result => {
              getResult();
              if (result == 2) {
                communicationsTested += 1;
              }
            });
        }
      }
    });
  },
  intervalSize + intervalSize * 0.4
);
