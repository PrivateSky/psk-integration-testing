$$.swarm.describe("testSandBoxSecurityExecution", {
	public: {
		assert: 'object'
	},
	init: function () {
		// first phase does not run in sandbox
		const util = require('util');
		// console.log(http);
		// console.log('util inspect: ', util.inspect(arguments, {showHidden: true, colors: true, showProxy: true}));
		// console.log('util inspect callee: ', util.inspect(arguments.callee.caller, {showHidden: true, colors: true, showProxy: true}));

		// console.log('callee', arguments.callee());
		this.swarm('space1/agent/agent_x2', 'checkCalleeAccessTest');
	},
	checkCalleeAccessTest: function () {
		const assert = $$.loadLibrary('double-check', './code/libraries/double-check', false)['double-check'].assert;
		const args = arguments;

		assert.doesThrow(function() {
			args.callee();
		}, 'did not throw');

		this.swarm('crl/agent/jhon_smith', 'readOutsideAgentSpaceTest');
	},
	readOutsideAgentSpaceTest: function() {
		const fs = require('fs');
		const assert = $$.loadLibrary('double-check', './code/libraries/double-check', false)['double-check'].assert;

		assert.doesThrow(function() {
			fs.readdirSync('..');
		}, 'access is allowed to a path that should not be accessible');

		this.swarm('crl/agent/jhon_smith', 'writeOutsideOwnAgentMqOutbound')
	},
	writeOutsideOwnAgentMqOutbound: function() {
		const fs = require('fs');
		const assert = $$.loadLibrary('double-check', './code/libraries/double-check', false)['double-check'].assert;

		assert.doesThrow(function() {
			fs.writeFileSync('mq/inbound/test.txt', ' test');
		}, 'writing access is allowed to a path that should not be accessible');

		this.swarm('crl/agent/jhon_smith', 'renameOutsidePathToOwnAgentMqFolders')
	},
	renameOutsidePathToOwnAgentMqFolders: function() {
		const fs = require('fs');
		const assert = $$.loadLibrary('double-check', './code/libraries/double-check', false)['double-check'].assert;

		assert.doesThrow(function() {
			fs.rename('mq/inbound/', 'mq/inbound/in2');
		}, 'should not have access to specified paths');

		this.swarm('crl/agent/jhon_smith', 'renameOnlyInsideTheOriginFolder')
	},
	renameOnlyInsideTheOriginFolder: function() {
		const fs = require('fs');
		const assert = $$.loadLibrary('double-check', './code/libraries/double-check', false)['double-check'].assert;

		const files = fs.readdirSync('mq/inbound');
		assert.doesThrow(function() {
			fs.rename('mq/inbound/' + files[0], 'mq/outbound/' + files[0]);
		}, 'should not have access to some specified folder');

		this.swarm('crl/agent/jhon_smith', 'watchOutsideOwnInboundFolder')
	},
	watchOutsideOwnInboundFolder: function() {
		const fs = require('fs');
		const assert = $$.loadLibrary('double-check', './code/libraries/double-check', false)['double-check'].assert;

		assert.doesThrow(function () {
			fs.watch('/mq/inbound/', () => {});
		}, 'should not have access outside inbound folder');
	}

});