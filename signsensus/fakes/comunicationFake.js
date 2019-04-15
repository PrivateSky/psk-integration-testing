var cfg = require("./simulationConfig").config;
var newPDS = require("../../../../modules/pskdb/lib/InMemoryPDS").newPDS;
var createConsensusManager = require("../../../../modules/signsensus/lib/consensusManager").createConsensusManager;

var g_arrPDSAdapters = [];
var g_arrConsensusManagers = [];

var g_maxPulse;                     // = cfg.SIMULATION_TIMEOUT/cfg.PULSE_PERIODICITY + 1 = 2000/300 + 1 = 7.666666666666667
var g_totalGeneratedCounter = 0;    //for `swarm.swarmName` in `exports.generateRandomTransaction`
var g_afterFinish = {};             //for statistics in `g_communicationOutlet.broadcastPulse`

function terminate() {
    //process.send({pid: process.pid, stats: exports.computeStatistics()})
    exports.dumpVSDs();
    console.log("[STATISTICS]:", exports.computeStatistics());
    process.exit();
}
var g_communicationOutlet = {                           //for `createConsensusManager` in `exports.init`
    broadcastPulse: function (from, pulse) {
        g_arrConsensusManagers.forEach(consensusManager => {
            if (consensusManager.nodeName != from) {
                setTimeout(function () {
                    consensusManager.recordPulse(from, pulse);
                }, getRandomInt(cfg.NETWORK_DELAY));
            } else {
                if (pulse.currentPulse > 2 * g_maxPulse) {
                    g_afterFinish[from] = true;
                }
            }
        });

        if (Object.keys(g_afterFinish).length >= cfg.MAX_NODES) {
            console.log("[AFTER FINISH]:", Object.keys(g_afterFinish).length, cfg.MAX_NODES);
            setTimeout(terminate, 1);
        }
    }
}


exports.init = function (config) {
    if (config) {
        console.log("default config overwritten");
        cfg = config;
    }
    g_maxPulse = cfg.SIMULATION_TIMEOUT / cfg.PULSE_PERIODICITY + 1;
    for (var i = 0; i < cfg.MAX_NODES; i++) {
        var pdsAdapter = newPDS(null);          //new InMemoryPDS(permanentPersistence = null, shareHoldersCount = undefined)
        g_arrPDSAdapters.push(pdsAdapter);
        g_arrConsensusManagers.push(createConsensusManager("Node" + i, g_communicationOutlet, pdsAdapter, cfg.PULSE_PERIODICITY));
    }
}

exports.generateRandomTransaction = function () {
    var nodeNumber = getRandomInt(cfg.MAX_NODES);
    var consensusManager = g_arrConsensusManagers[nodeNumber];
    var pdsStorage = g_arrPDSAdapters[nodeNumber].getHandler();

    var swarm = {
        swarmName: "Swarm:" + g_totalGeneratedCounter
    };

    var howMany = getRandomInt(cfg.MAX_KEYS_COUNT / 4) + 1;
    for (var i = 0; i < howMany; i++) {
        var keyName = "key" + getRandomInt(cfg.MAX_KEYS_COUNT);

        var dice = getRandomInt(6);

        if (dice == 0) {  //concurrency issues
            keyName = "sameKey";
            pdsStorage.writeKey(keyName, getRandomInt(10000));
        }

        if (dice <= 4) {
            pdsStorage.readKey(keyName);
        } else {
            pdsStorage.writeKey(keyName, getRandomInt(10000));
        }
    }

    g_arrPDSAdapters[nodeNumber].computeSwarmTransactionDiff(swarm, pdsStorage);
    consensusManager.createTransactionFromSwarm(swarm);
    g_totalGeneratedCounter++;
}

exports.dumpVSDs = function () {
    g_arrConsensusManagers.forEach(item => item.dump());
}

exports.computeStatistics = function () {
    var results = [];
    g_arrConsensusManagers.forEach(item => results.push(item.exportStatistics()));

    if (results.length <= 0) {
        return {};
    }

    var stat = {};
    var indicators = Object.keys(results[0]);
    for (var i = 0; i < indicators.length; i++) {
        let indicator = indicators[i];
        let sum = results.reduce((acc, item) => acc + item[indicator], 0);
        stat[indicator] = sum / results.length; //arithmetic mean
    }
    return stat;
}
