require("../../../builds/devel/pskruntime");
const tir = require('./../test-util/tir.js');
const assert = require('double-check').assert;

const domain = 'local';
const agents = [
    'agent_007'
];

const swarm = {
    MySwarm: {
        public: {
            a1: "int",
            a2: "int",
            result: "int",
            interceptorCollector: "string",
        },
        begin: function (a1, a2) {
            this.a1 = a1;
            this.a2 = a2;
            // this.start('space1\\agent\\agent_007', "doStep", 3).onReturn(this.otherExecution);
            //this.swarm('agent_007', "doStep", 3);
            this.doStep(3);
        },
        doStep: function (a) {
            this.result = this.a1 + this.a2 + a;
            //this.swarm("exampleAgent", "otherExecution");
            this.otherExecution(null);
        },
        otherExecution: function (err, res, wholeSwarm) {
            var assert = require("double-check").assert;
            assert.equal(err, null, "Error");
            //assert.equal(this.result, undefined, "this.result should be undefined");
            //assert.equal(res, 6, "Invalid value of res");
            //this.update(wholeSwarm);
            //assert.equal(this.result, 6, "this.result should be 6 after update");
            this.return();
        }
    },

    InterceptorSwarm: {
        setup: function () {
            $$.interceptor.register('MySwarm', 'begin', 'before', function () {
                this.interceptorCollector += ' begin_before';
                console.log(this.interceptorCollector);
            });
            $$.interceptor.register('MySwarm', 'begin', 'after', function () {
                this.interceptorCollector += ' begin_after';
                console.log(this.interceptorCollector);
            });
            $$.interceptor.register('MySwarm', 'doStep', 'before', function () {
                this.interceptorCollector += ' doStep_before';
                console.log(this.interceptorCollector);
            });
            $$.interceptor.register('MySwarm', 'doStep', 'after', function () {
                this.interceptorCollector += ' doStep_after';
                console.log(this.interceptorCollector);
            });
            $$.interceptor.register('MySwarm', 'otherExecution', 'before', function () {
                this.interceptorCollector += ' otherExecution_before';
                console.log(this.interceptorCollector);
            });
            $$.interceptor.register('MySwarm', 'otherExecution', 'after', function () {
                this.interceptorCollector += ' otherExecution_after';
                console.log(this.interceptorCollector);
            });

            this.return();
        }
    }
};

assert.callback('test interceptor call order', (finished) => {
    tir.addDomain(domain, agents, swarm).launch(5000, () => {
        tir.interact('local', 'agent_007').startSwarm("InterceptorSwarm", "setup")
        .onReturn( () => {
                console.log("interceptor set for agent_007");
                tir.interact('local', 'agent_007')
                .startSwarm("MySwarm", "begin", 1, 2)
                .onReturn(result => {
                    // assert.equal("Echo Hello", result);
                    finished();
                    tir.tearDown(0);
                });
        });

    });
}, 3500);
