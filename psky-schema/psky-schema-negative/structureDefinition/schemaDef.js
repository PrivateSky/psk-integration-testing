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
        secure: {
            a3: 'integer',
        },
        local: {
            a4: 'integer'
        },
        phase1: function (a1, a2) {
            this.a1 = a1;
            this.a2 = a2;
            this.a3 = a1;
            this.a4 = a1;
            this.result = this.a1 + this.a2;

            console.info('--------- WE ARE THIS:', this);
            this.swarm("mi6", "phase2", "");
        },
        phase2: function () {
            console.log('--------- WE ARE THIS:', typeof this);
            if (!this.a4) this.return(null);
            this.return(this.public);
        }
    }
};


assert.callback('Swarm Structure: local/private', (finished) => {
    tir.addDomain(domain, agents, swarms).launch(3000, () => {
        tir.interact('local', 'hq').startSwarm('intel', 'phase1', 1, 2).onReturn((result) => {
            console.log("RESULT")
            console.log(result)
            console.log("END RESULT")
            if (result) finished();
        });
    });
}, 2000);
