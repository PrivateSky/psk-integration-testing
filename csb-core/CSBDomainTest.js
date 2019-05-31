const tir = require('./../test-util/tir.js');
const assert = require('double-check').assert;
const domain = 'csbTestDomain';
const agentOne = 'csbWorkingAgent';
const agents = [agentOne];



assert.callback('Local connection testing', (finished) => {
  tir.addDomain(domain, agents, "./../builds/devel/csbCore.js").launch(5000, () => {

   setTimeout(function(){
     tir.interact(domain, agentOne).startSwarm("echo", "say").onReturn(result => {
       console.log(result);

     });
     tir.interact(domain, agentOne).startSwarm("CSBValidator", "start").onReturn(result => {
       console.log(result);

     });
   }, 2000) ;
  });
}, 3500);
