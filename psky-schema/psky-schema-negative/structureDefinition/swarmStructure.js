const tir = require('./../../test-util/tir.js');
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
        test: {
            a3: 'integer',
            a4: 'integer'
        },
        begin: function (a1, a2) {
            this.a1 = a1;
            this.a2 = a2;
            this.result = this.a1 + this.a2;

            console.info('--------- WE ARE THIS:', this);
            this.return(this.result);
        }
    }
};


assert.callback('Swarm Structure Phase type checking', (finished) => {
    tir.addDomain(domain, agents, swarms).launch(3000, () => {
        tir.interact('local', 'hq').startSwarm('intel', 'begin', 1, 2).onReturn((result) => {
            console.log("Test should not pass. Phase must be a function");
            // finished();
        });
    });

}, 2000);
