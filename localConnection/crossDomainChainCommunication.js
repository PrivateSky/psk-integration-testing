const tir = require('../test-util/tir.js');
const assert = require('double-check').assert;
const fs = require('fs');

const args = process.argv.slice(2);

const intervalSize = 6000;
const noOfDomains = args[0] || 3;
const domainThrowingErrorIndex = args[1] || 300;
const noOfAgentsPerDomain = 1;
const noOfInteractionsTested = args[2] || noOfDomains;

const domainNameBase = 'pskDomain';
const agentNameBase = 'pskAgent';

var deployedDomains = 0;
const swarms = {
  commTest: {
    do1: function(input, domain2Config, domain3Config) {
      console.log(`Do1`);
      if (input == '#') {
        throw new Error('INTEDED ERROR');
      } else {
        const assert = require('double-check').assert;
        const path = require('path');
        const interact = require('interact');
        var returnChannel = path.join(
          domain2Config.outbound,
          Math.random()
            .toString(36)
            .substr(2, 9)
        );
        input += 100;
        interact
          .createNodeInteractionSpace('pskAgent_0', domain2Config.inbound, returnChannel)
          .startSwarm('commTest', 'do2', input, domain3Config)
          .onReturn(result => {
            assert.equal(input, 100, 'NOT RIGHT MATE');
            console.log(`FROM INTERACTION SPACEEEE ${result} `);
            this.return(result);
          });
      }
    },
    do2: function(input, domainConfig) {
      console.log(`Do2`);
      const assert = require('double-check').assert;
      const path = require('path');
      const interact = require('interact');
      var returnChannel = path.join(
        domainConfig.outbound,
        Math.random()
          .toString(36)
          .substr(2, 9)
      );
      input += 10;
      interact
        .createNodeInteractionSpace('pskAgent_0', domainConfig.inbound, returnChannel)
        .startSwarm('commTest', 'do3', input)
        .onReturn(result => {
          assert.equal(input, 110, 'NOT RIGHT MATE');
          console.log(`FROM INTERACTION SPACEEEE ${result} `);
          this.return(result);
        });
    },
    do3: function(input) {
      console.log(`Do3`);
      input += 1;
      console.log(`FINAL RESULTTTTTTTTTTTT: ${input}`);
      this.return(input);
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
  `Swarmurile  din agenti apartinand de domenii separate pot comunica inlantuit pentru a genera un rezultat .(numar incercari:${noOfInteractionsTested})`,
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
        let thirdDomain = Math.floor(Math.random() * noOfDomains);
        while (
          firstDomain == secondDomain ||
          secondDomain == thirdDomain ||
          firstDomain == thirdDomain
        ) {
          firstDomain = Math.floor(Math.random() * noOfDomains);
          secondDomain = Math.floor(Math.random() * noOfDomains);
          thirdDomain = Math.floor(Math.random() * noOfDomains);
        }
        let domain2Configuration = tir.getDomainConfig(`pskDomain_${secondDomain}`);
        let domain3Configuration = tir.getDomainConfig(`pskDomain_${thirdDomain}`);
        console.log(
          `Communication between pskDomain_${firstDomain}, pskDomain_${secondDomain},pskDomain_${thirdDomain}`
        );
        if (firstDomain == domainThrowingErrorIndex) {
          interactions[firstDomain][0]
            .startSwarm('commTest', 'do1', '#', domain2Configuration, domain3Configuration)
            .onReturn(result => {
              getResult();
              if (result == 111) {
                communicationsTested += 1;
              }
            });
        } else {
          interactions[firstDomain][0]
            .startSwarm('commTest', 'do1', 0, domain2Configuration, domain3Configuration)
            .onReturn(result => {
              getResult();
              if (result == 111) {
                communicationsTested += 1;
              }
            });
        }
      }
    });
  },
  intervalSize + intervalSize * 0.4
);
