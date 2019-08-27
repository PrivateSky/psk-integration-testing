const tir = require('../../../psknode/tests/util/tir');
const assert = require('double-check').assert;
const utils = require('./testUtils');

const args = process.argv.slice(2);

const intervalSize = 6000;
const noOfDomains = args[0] || 10;
const domainThrowingErrorIndex = args[1] || 300;
const noOfAgentsPerDomain = 1;

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

utils.initData(intervalSize, noOfDomains, noOfAgentsPerDomain, swarms);
var interactions = utils.interactions;

assert.callback(
  `Swarmurile  agentilor din ${noOfDomains} domenii separate pot fi apelate.`,
  finished => {
    tir.launch(intervalSize + intervalSize * 0.3, () => {
      var communicationsTested = 0;
      var swarmCounter = 0;
      function getResult() {
        swarmCounter++;
      }
      setInterval(() => {
        if (communicationsTested == noOfDomains - 1) {
          assert.true(communicationsTested == noOfDomains - 1, `Nu toti agentii au comunicat`);
          finished();
          tir.tearDown(0);
        }
      }, 500);
      for (let d = 0; d < utils.deployedDomains; d++) {
        utils.setupInteractions(d, utils.noOfAgentsPerDomain);
      }
      console.log(`DEPLOYEDDOMAINS:${utils.deployedDomains}`);
      for (let i = 0; i < utils.deployedDomains - 1; i++) {
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
