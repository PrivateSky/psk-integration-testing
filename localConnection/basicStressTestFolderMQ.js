const tir = require('./../test-util/tir.js');
const assert = require('double-check').assert;
const domain = 'superdomain';
const agentName = "superAgent_"+Math.random().toString(36).substr(2, 9);
const agents = [agentName];

const swarm = {
  first: {
    phase: function() {
      this.return(1000);
    }
  },
  second: {
    phase: function(){
      this.return(1);
    }
  }
};

assert.callback('Basic stress test for FolderMQ', (finished) => {
    var runs = 100;
    var targetedResult = runs*1000+runs*runs*1;
    var result = 0;

    tir.addDomain(domain, agents, swarm).launch(25000, () => {
        var ti = tir.interact(domain, agentName);
        var callbacks = 0;

        for(let i=0; i<runs; i++){
            ti.startSwarm("first", "phase").onReturn(firstSwarmRes => {
            result += firstSwarmRes;

            for(let j=0; j<runs; j++){
                ti.startSwarm("second", "phase").onReturn(secondSwarmRes => {
                    callbacks++;
                    result += secondSwarmRes;
                    console.log(callbacks);
                    if(callbacks == runs*runs){
                        console.log("Result", result);
                        assert.equal(targetedResult, result, "Expected to get "+targetedResult);
                        finished();
                        tir.tearDown(0);
                    }
              });
            }
          });
        }

    });
}, 10000);
