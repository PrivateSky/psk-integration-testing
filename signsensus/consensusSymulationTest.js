const consensus = require("../../../modules/signsensus/lib/consensusManager");

var cfg = require("../../../psk-integration-testing/signsensus/fakes/simulationConfig").config;
var network = require("../../../psk-integration-testing/signsensus/fakes/comunicationFake");

var cutil = require("../../modules/signsensus/lib/consUtil");

network.init();
var numberTransactions = cfg.MAX_TRANSACTIONS;

while(numberTransactions > 0){
    setTimeout(function () {
        network.generateRandomTransaction();
        //console.log("New transaction!");
    }, cutil.getRandomInt(cfg.MAX_TRANSACTION_TIME));
    numberTransactions--;
}

console.log(cfg.MAX_TRANSACTIONS,numberTransactions);