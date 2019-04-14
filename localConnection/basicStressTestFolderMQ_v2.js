const tir = require('./../test-util/tir.js');
const assert = require('double-check').assert;
const domain = 'superdomain';
const noAgents = 10;
var agents = [];
for(var i=0; i<noAgents; i++){
    agents.push("superAgent_"+Math.random().toString(36).substr(2, 9));
}

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

var index = 0;
function getAgent(){
    if(index >= noAgents){
        index = 0;
    }
    const agent = agents[index];
    index++;
    return agent;
}

assert.callback('Basic stress test for FolderMQ vers. 2', (finished) => {
    var runs = 100;
    var targetedResult = runs*1000+runs*runs*1;
    var result = 0;

    tir.addDomain(domain, agents, swarm).launch(35000, () => {
        var callbacks = 0;
        for(let i=0; i<runs; i++){
            var ti = tir.interact(domain, getAgent());

            ti.startSwarm("first", "phase").onReturn(firstSwarmRes => {
            result += firstSwarmRes;

            for(let j=0; j<runs; j++){
                ti.startSwarm("second", "phase").onReturn(secondSwarmRes => {
                    callbacks++;
                    result += secondSwarmRes;
                    console.log(`Received <${callbacks}> swarm results from a total of <${runs*runs}>`);
                    if(callbacks == runs*runs){
                        console.log("Result", result, "Expected result", targetedResult);
                        assert.equal(targetedResult, result, "Expected to get "+targetedResult);
                        finished();
                        tir.tearDown(0);
                    }
              });
            }
          });
        }
    });
}, 20000);
