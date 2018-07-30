const consensus = require("../../../modules/signsensus/lib/consensusManager");

var cfg = require("./fakes/simulationConfig").config;
var network = require("./fakes/comunicationFake");


getRandomInt = function getRandomInt(max) {
    if(!max){
        console.log("getRandomInt with undefined argument. Defaulting to 1000", new Error());
        max = 1000;
    }
    var n = Math.floor(Math.random() * max);
    return n;
}

network.init();
var numberTransactions = cfg.MAX_TRANSACTIONS;

while(numberTransactions > 0){
    setTimeout(function () {
        network.generateRandomTransaction();
        //console.log("New transaction!");
    }, getRandomInt(cfg.MAX_TRANSACTION_TIME));
    numberTransactions--;
}

console.log(cfg.MAX_TRANSACTIONS,numberTransactions);