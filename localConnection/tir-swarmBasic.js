const tir = require('./../test-util/tir.js');
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
    begin: function(a1, a2) {
      this.a1 = a1;
      this.a2 = a2;
      this.swarm('mi6', 'doStep', 3);
    },
    doStep: function(a) {
      this.result = this.a1 + this.a2 + a;
      this.swarm('hq', 'afterExecution', this.result);
    },
    afterExecution: function(result) {
      console.info('--------- WE ARE THIS:', this);
      const assert = require('double-check').assert;
      // assert.equal(this.result, undefined, "this.result should be undefined");
      assert.equal(result, 6, 'Invalid value of result');
      //console.log("After Execution",res);
      this.return(result);
    }
  }
};

assert.callback(
  'Swarm Basic',
  finished => {
    tir.addDomain(domain, agents, swarms).launch(3000, () => {
      tir
        .interact('local', 'hq')
        .startSwarm('intel', 'begin', 1, 2)
        .onReturn(result => {
          assert.equal(result, 6, 'this.result should be 6 after update');
          finished();
        });
    });
  },
  6000
);
