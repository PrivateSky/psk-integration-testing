require("../../../builds/devel/pskruntime");
// require("callflow");
// require("launcher");
var assert = require("double-check").assert;

//inspired by `swarmBasicTest.js`
var f = $$.swarms.describe("MySwarm", {
    type: "flow",       // flow, key, contract
    public: {
        a1: "int",
        a2: "int",
        result: "int",
        interceptorCollector: String,
    },
    resetInterceptorCollector: function () {
        this.interceptorCollector = '===';
    },
    begin: function (a1, a2, callback) {
        this.a1 = a1;
        this.a2 = a2;
        this.callback = callback;
        this.startSwarm('global.MySwarm', "doStep", 3).onReturn(this.otherExecution);    //Nobody listening for <swarm_for_execution>!
    },
    doStep: function (a) {
        this.result = this.a1 + this.a2 + a;
        this.return(null, this.result);
    },
    otherExecution: function (err, res, wholeSwarm) {
        this.update(wholeSwarm);
        this.callback();
    }
})();


assert.true(false,"IT DOES NOT WORK: 'Nobody listening for <swarm_for_execution>!'");
throw "Grrrrrrrrrrrrrrrrrrrrrrr...";

assert.callback("test_interceptor_call_order_when_swarm_methods_invokes_anothers", function (callback) {
    f.resetInterceptorCollector();

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

    f.begin(1, 2, callback);
    console.log(f.interceptorCollector);
})
