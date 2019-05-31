const utils = require('./testUtils');
const tir = require('./../test-util/tir.js');
const assert = require('double-check').assert;

var args = process.argv.slice(2);


let noOfDomains = args[0] || 1;
let noOfAgentsPerDomain = args[1] || 1;
let loopTimeoutValue = args[2] || 50;
let minLimitOfSwarmExecuted = args[3] || 10;
let intervalSize = args[4] || 60000;


utils.initData(intervalSize, noOfDomains, noOfAgentsPerDomain, minLimitOfSwarmExecuted);

 assert.callback(`Cate swarm-uri se pot executa in ${utils.intervalSize}ms (${utils.deployedDomains} domenii, ${utils.noOfAgentsPerDomain} agenti/domeniu)`, (finished) => {
    tir.launch(utils.intervalSize+utils.intervalSize*0.3, () => {
        var swarmCounter = 0;

        function getResult(){
            swarmCounter ++;
        }

        for(let d = 0; d<utils.deployedDomains; d++){
            utils.setupInteractions(d, utils.noOfAgentsPerDomain);
        }

        setTimeout(()=>{
            console.log("Number of started swarms", swarmCounter);
            assert.true(swarmCounter>utils.minLimitOfSwarmExecuted, `Limita minima nedepasita!`);
            finished();
            tir.tearDown(0);
        }, utils.intervalSize);

        /*for(let i=0; i<deployedDomains; i++){
            for(let j=0; j<noOfAgentsPerDomain; j++){
                tir.interact(constructDomainName(i), constructAgentName(j)).startSwarm("echo", "say", "Hello").onReturn(result => {
                    swarmCounter++;
                });
            }
        }*/

        let i=0;
        let MaxCounter = utils.minLimitOfSwarmExecuted*1;
        var started = 0;
        var loopTimeout =0;
        function domainLoop(){
            let j=0;
            while(j<utils.noOfAgentsPerDomain){
                var interact = utils.interactions[i][j];
                setTimeout(()=>{
                    started++;
                    interact.startSwarm("echo", "say", "Hello").onReturn(result => {
                        getResult();
                    });
                }, 0); 
                MaxCounter++;               
                j++;
            }
            i = i++ % utils.deployedDomains;
            if(MaxCounter === 0){
                console.log("Stoping cycling");
            }

            started-swarmCounter > 100 ? loopTimeout = loopTimeoutValue : loopTimeout = 0;

            setTimeout(domainLoop, loopTimeout);
        }
        console.log("Preparing to start interactions");
        domainLoop();
        
   });
 }, utils.intervalSize+utils.intervalSize*0.4);





