const tir = require('./../../../../../psknode/tests/util/tir');
const assert = require('double-check').assert;
const domain = 'local';
const agents = ['hq', 'mi6'];

const swarms = {
    intel: {
        phase1: function () {
            console.info('--------- WE ARE THIS:', this);
            this.swarm("interaction", "phase2");
        },
        phase2: "interaction",
        phase3: function () {
        }
    }
};


assert.callback('Interaction', (finished) => {
    tir.addDomain(domain, agents, swarms).launch(3000, () => {
        tir.interact('local', 'hq').startSwarm('intel', 'phase1').on({
            phase2: function () {
                this.swarm("phase3");
            }
        });
    });
}, 2000);
