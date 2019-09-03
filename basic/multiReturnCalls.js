const tir = require('../../../psknode/tests/util/tir');
const assert = require('double-check').assert;
const domain = 'local';
const agent = 'hq';
const agents = [agent];

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

assert.callback('Multiple returns of a swarm', (finished) => {
    tir.addDomain(domain, agents, swarms).launch(4000, () => {
        let calls = 0;
        let callback = (err, result) => {
            assert.equal([1, 2, 3, 4].indexOf(result) != -1, true);
            assert.equal(err, null);
            calls += 1;
            if (calls === 4) {
                finished();
                tir.tearDown();
            }else{
                setTimeout(()=>{
                    cim.onReturn(callback);
                },0);
            }
        };

        var cim = tir.interact(domain, agent).startSwarm('intel', 'doSomething');
        cim.onReturn(callback);
    });
}, 6000);
