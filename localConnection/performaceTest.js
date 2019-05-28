const tir = require('./../test-util/tir.js');
const assert = require('double-check').assert;

const intervalSize = 6000;
const noOfDomains = 1;
const noOfAgentsPerDomain = 1;
const minLimitOfSwarmExecuted = 10;

const domainNameBase = 'pskDomain';
const agentNameBase = 'pskAgent';

var deployedDomains = 0;

const swarms = {
    echo: {
      say: function(input) {
        this.return(`Echo: ${input}`);
      }
    }
};

// ----------------- domand and agents setup ------------------------

function constructDomainName(sufix){
    return `${domainNameBase}_${sufix}`;
}

function constructAgentName(sufix){
    return `${agentNameBase}_${sufix}`;
}

function setupDomain(noOfAgents){
    var agents = [];
    interactions[deployedDomains] = [];
    
    while(noOfAgents>0){
        noOfAgents--;
        agents.push(constructAgentName(agents.length));
    }

    tir.addDomain(constructDomainName(deployedDomains), agents, swarms);
    deployedDomains++;
}

function setupInteractions(domainIndex, noOfAgents){
    for(let i=0; i<noOfAgents; i++){
        interactions[domainIndex].push(tir.interact(constructDomainName(domainIndex), constructAgentName(i)));
    }
}

let interactions = {};

for(let i=0; i<noOfDomains; i++){
    setupDomain(noOfAgentsPerDomain);
}

// ----------------- domand and agents setup ------------------------

 assert.callback(`Cate swarm-uri se pot executa in ${intervalSize}ms (${deployedDomains}, ${noOfAgentsPerDomain}`, (finished) => {
    tir.launch(intervalSize+intervalSize*0.3, () => {
        var swarmCounter = 0;

        function getResult(){
            swarmCounter ++;
        }

        for(let d = 0; d<deployedDomains; d++){
            setupInteractions(d, noOfAgentsPerDomain);
        }

        setInterval(()=>{
            console.log("Received:", swarmCounter, "Started:",  started);
        }, 1000);
        
        setTimeout(()=>{
            console.log("swarmCounter", swarmCounter);
            assert.true(swarmCounter>minLimitOfSwarmExecuted, `Limita minima nedepasita!`);
            finished();
            tir.tearDown(0);
        }, intervalSize);

        /*for(let i=0; i<deployedDomains; i++){
            for(let j=0; j<noOfAgentsPerDomain; j++){
                tir.interact(constructDomainName(i), constructAgentName(j)).startSwarm("echo", "say", "Hello").onReturn(result => {
                    swarmCounter++;
                });
            }
        }*/

        let i=0;
        let MaxCounter = minLimitOfSwarmExecuted*1;
        var started = 0;
        function domainLoop(){
            console.log("Domain loop");
            let j=0;
            while(j<noOfAgentsPerDomain){
                var interact = interactions[i][j];
                setTimeout(()=>{
                    started++;
                    console.log("Swarm Started");
                    interact.startSwarm("echo", "say", "Hello").onReturn(result => {
                        getResult();
                    });
                }, 0); 
                MaxCounter++;               
                j++;
            }
            i = i++ % deployedDomains;
            if(MaxCounter === 0){
                console.log("Stoping cycling");
            }
            setTimeout(domainLoop, 0);
        }
        console.log("Preparing to start interactions");
        domainLoop();
        
   });
 }, intervalSize+intervalSize*0.4);





