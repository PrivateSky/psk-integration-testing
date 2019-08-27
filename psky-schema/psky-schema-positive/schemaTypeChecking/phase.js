const tir = require('./../../../../../psknode/tests/util/tir');
const assert = require('double-check').assert;
const domain = 'local';
const agents = ['hq', 'mi6'];

const swarms = {
    intel: {
        public: {
            a1: 'integer',
            a2: 'integer',
            result: 'integer'
        },
        phase: "string",
        begin: function (a1, a2) {
            console.info('--------- WE ARE THIS:', this);
            this.return(this.result);
        }
    }
};


assert.callback('Swarm Structure Phase must be a function', (finished) => {
    tir.addDomain(domain, agents, swarms).launch(3000, () => {
        tir.interact('local', 'hq').startSwarm('intel', 'begin', 1, 2).onReturn((result) => {
            finished();
        });
    });

}, 2000);
