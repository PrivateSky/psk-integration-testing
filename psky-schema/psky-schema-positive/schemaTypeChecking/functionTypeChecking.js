const tir = require('../../../../../psknode/tests/util/tir');
const assert = require('./node_modules/double-check').assert;
const domain = 'local';
const agents = ['hq', 'mi6'];

// const Schema = require("psky-schema");

const swarms = {
	intel: {
		public: {
			a1: 'integer',
			a2: 'integer',
		},
		secure: {},
		local: {},
		begin: function(a1, a2) {
			this.a1 = a1;
			this.a2 = 'string';

			this.return(this.a1 + this.a2);
		},
	},
};

assert.callback(
	'Function type checking',
	finished => {
		tir.addDomain(domain, agents, swarms).launch(3000, () => {
			tir.interact('local', 'hq')
				.startSwarm('intel', 'begin', 5, 7)
				.onReturn(result => {
					/**
					 * Simple test that checks if the basisc schema is validated properly.
					 */
					assert.equal(typeof 5, typeof result, 'Type violation : Result is not a number');

					tir.tearDown(0);
					finished();
				});
		});
	},
	2000
);
