const tir = require('../test-util/tir.js');
const assert = require('double-check').assert;
const utils = require('./testUtils');

const args = process.argv.slice(2);

const intervalSize = 6000;
const noOfDomains = args[0] || 2;
const noOfAgentsPerDomain = 1;
const noOfInteractionsTested = args[2] || noOfDomains;

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
      const interaction = interact.createNodeInteractionSpace(
        'pskAgent_0',
        domainConfig.inbound,
        returnChannel
      );
      input += 'PING';
      interaction.startSwarm('commTest', 'extension', input).onReturn(result => {
        console.log(`FROM INTERACTION SPACEEEE ${result} `);
        result += 'PING';
        if (result != 'PINGPONGPINGPONG') {
          interaction.startSwarm('commTest', 'extension', result).onReturn(result1 => {
            this.return(result1);
          });
        } else {
          this.return(result);
        }
      });
    },
    extension: function(input) {
      if (input == '#PING') {
        throw new Error('Intended error');
      } else {
        input += 'PONG';
        this.return(input);
      }
    }
  }
};

utils.initData(intervalSize, noOfDomains, noOfAgentsPerDomain, swarms);
var interactions = utils.interactions;

assert.callback(
  `Doi agenti din domenii diferite pot interactiona in mod repetat.(numar incercari:${noOfInteractionsTested})`,
  finished => {
    tir.launch(intervalSize + intervalSize * 0.3, () => {
      var communicationsTested = 0;
      var swarmCounter = 0;
      function getResult() {
        swarmCounter++;
      }

      for (let d = 0; d < utils.deployedDomains; d++) {
        utils.setupInteractions(d, noOfAgentsPerDomain);
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
        let domainConfiguration = tir.getDomainConfig(`pskDomain_1`);
        interactions[0][0]
          .startSwarm('commTest', 'default', '', domainConfiguration)
          .onReturn(result => {
            getResult();
            console.log(result);
            if (result == 'PINGPONGPINGPONG') {
              communicationsTested += 1;
            }
          });
      }
    });
  },
  intervalSize + intervalSize * 0.4
);
