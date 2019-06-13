const tir = require('./../test-util/tir.js');
const assert = require('double-check').assert;
const domain = 'local';
const agents = ['hq', 'mi6'];

const swarms = {
	intel: {
		public: {
			a1: {
				a1: {
					a1: {
						a1: {
							a1: {
								a2: function() {},
							},
						},
					},
				},
			},
			result: 'integer',
		},
		begin: function(a1, a2) {
			console.info('--------- WE ARE THIS:', this);
			this.return(this.result);
		},
	},
};

assert.callback(
	'Swarm Structure Phase type recursive checking',
	finished => {
		tir.addDomain(domain, agents, swarms).launch(3000, () => {
			tir.interact('local', 'hq')
				.startSwarm('intel', 'begin', 1, 2)
				.onReturn(result => {
					console.log('Test should not pass. Function definitions are allowed only in phases'); // finished();
				});
		});
	},
	2000
);
