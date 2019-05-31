const tir = require('./../test-util/tir.js');
const assert = require('double-check').assert;

exports.intervalSize;
exports.noOfDomains;
exports.noOfAgentsPerDomain;
exports.minLimitOfSwarmExecuted;
exports.deployedDomains = 0;
exports.domainNameBase = 'pskDomain';
exports.agentNameBase = 'pskAgent';
exports.interactions = {};
exports.swarms = {
    echo: {
        say: function (input) {
            this.return(`Echo: ${input}`);
        }
    }
};

// ----------------- domain and agents setup ------------------------

module.exports.constructDomainName = function (sufix) {
    return `${this.domainNameBase}_${sufix}`;
};

module.exports.constructAgentName = function (sufix) {
    return `${this.agentNameBase}_${sufix}`;
};

module.exports.setupDomain = function (noOfAgents) {
    var agents = [];
    this.interactions[this.deployedDomains] = [];

    while (noOfAgents > 0) {
        noOfAgents--;
        agents.push(this.constructAgentName(agents.length));
    }

    tir.addDomain(this.constructDomainName(this.deployedDomains), agents, this.swarms);
    this.deployedDomains++;
};

module.exports.setupInteractions = function (domainIndex, noOfAgents) {
    for (let i = 0; i < noOfAgents; i++) {
        this.interactions[domainIndex].push(tir.interact(this.constructDomainName(domainIndex), this.constructAgentName(i)));
    }
};


//--------------------------------------------------------------------

module.exports.initDefaults = function () {
    this.initData(60000, 1, 1, 10);
};

module.exports.initData = function (intervalSize, noOfDomains, noOfAgentsPerDomain, minLimitOfSwarmExecuted) {
    this.intervalSize = intervalSize;
    this.noOfDomains = noOfDomains;
    this.noOfAgentsPerDomain = noOfAgentsPerDomain;
    this.minLimitOfSwarmExecuted = minLimitOfSwarmExecuted;
    for (let i = 0; i < noOfDomains; i++) {
        this.setupDomain(noOfAgentsPerDomain);
    }
};