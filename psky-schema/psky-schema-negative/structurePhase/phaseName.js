const tir = require('./../../test-util/tir.js');
const assert = require('double-check').assert;
const domain = 'local';
const agents = ['hq', 'mi6'];

const args = process.argv.slice(2);
const names = args.length ? args : ["public", "secure", "local", "private", "protected"];

let swarms = {
    intel: {}
};
const build = () => {
    names.map(name => {
        swarms.intel[name] = function (a1, a2) {
            this.a1 = a1;
            this.a2 = a2;
            this.result = this.a1 + this.a2;

            console.info('--------- WE ARE THIS:', this);
            this.return(this.result);
        }
    });
}

assert.callback('Swarm Structure Phase type checking', (finished) => {
    build();

    tir.addDomain(domain, agents, swarms).launch(3000, () => {
        names.map(name => {
            tir.interact('local', 'hq').startSwarm('intel', name, 1, 2).onReturn((result) => {
            });
        });
    });

}, 2000);
