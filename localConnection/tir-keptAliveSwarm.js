const tir = require('./../test-util/tir.js');
const assert = require('double-check').assert;
const domain = 'local';
const agents = ['hq'];

const swarms = {
    intel: {
        doSomething:function() {
            [1, 2, 3, 4].forEach(val => {
                setTimeout(() => {
                    this.return(null, val);
                }, val * 300);
            });
        }
    }
};

assert.callback('Kept Alive Swarm', (finished) => {
    tir.addDomain(domain, agents, swarms).launch(15000, () => {
        let calls = 0;
        tir.interact('local', 'hq').startSwarm('intel', 'doSomething').onReturn((err, result) => {
            assert.equal([1, 2, 3, 4].indexOf(result) >= 0, true);
            assert.equal(err, null);
            calls += 1;
            if (calls === 4) {
                finished();
            }
        });
    });

}, 16000);
