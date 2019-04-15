require("../../../../builds/devel/pskruntime");
require("../../../../builds/devel/psknode");

// const consensus = require("../../../../modules/signsensus/lib/consensusManager");
//default config
var cfg = require("../fakes/simulationConfig").config;
var args = process.argv;
if(args && args.length>2){
	for(var i=2; i<args.length; i++){
		try{
			console.log(`[ARG ${i}]: ${args[i]}`)
			var arg = JSON.parse(args[i]);
			if(arg.cfg){
				//getting config from parent proc
				cfg = arg.cfg;
			}
		}catch(e){
			//...ignore it
			console.log(`[ARG ${i} WITH ERROR]: ${e.msg}`);
		}

	}
}

var network = require("../fakes/comunicationFake");


getRandomInt = function getRandomInt(max) {
    if(!max){
        console.log("getRandomInt with undefined argument. Defaulting to 1000", new Error());
        max = 1000;
    }
    var n = Math.floor(Math.random() * max);
    return n;
}

network.init(cfg);
var numberTransactions = cfg.MAX_TRANSACTIONS;

while(numberTransactions > 0){
	setTimeout(function () {
		network.generateRandomTransaction();
		//console.log("New transaction!");
	}, getRandomInt(cfg.MAX_TRANSACTION_TIME));
	numberTransactions--;
}

/*setTimeout(function(){
	process.send({pid: process.pid, stats: network.exportStatistics()});
	network.dumpVSDs();
	process.exit();
}, cfg.SIMULATION_TIMEOUT + 1000);*/

