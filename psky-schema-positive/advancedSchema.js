const tir = require('../test-util/tir.js');
const assert = require('double-check').assert;
const domain = 'local';
const agents = ['hq', 'mi6'];

// const Schema = require("psky-schema");

const swarms = {
	intel: {
		public: {
			s: 'string',
		},
		secure: {
			i: 'integer',
		},
		local: {
			f: 'float',
		},
		begin: function() {
			this.s = 'a';
			this.i = 5;
			this.f = 5.99;

			this.swarm('mi6', 'doStep', 3);
		},
		doStep: function(a) {
			this.result = this.a1 + this.a2 + a;
			this.swarm('hq', 'afterExecution', this.result);
		},
		afterExecution: function(result) {
			console.info('--------- WE ARE THIS:', this); // const assert = require('double-check').assert; // assert.equal(this.result, undefined, "this.result should be undefined"); // assert.equal(result, 6, "Invalid value of result"); //console.log("After Execution",res);
			this.return({ f: this.f, i: this.i, s: this.s });
		},
	},
};

assert.callback(
	'Schema Basic',
	finished => {
		tir.addDomain(domain, agents, swarms).launch(3000, () => {
			tir.interact('local', 'hq')
				.startSwarm('intel', 'begin')
				.onReturn(result => {
					/**
					 * Simple test that checks if the basisc schema is validated properly.
					 */
					assert.equal(5.99, result.f, 'The swarm did not return the proper value. float ');
					assert.equal(5, result.i, 'The swarm did not return the proper value. integer');
					assert.equal('a', result.s, 'The swarm did not return the proper value. string');

					tir.tearDown(0);
					finished();
				});
		});
	},
	2000
);
