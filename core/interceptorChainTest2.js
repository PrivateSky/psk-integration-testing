/*
    W I N D O W S   S P E C I F I C :
        PLEASE ENABLE "Developer mode"!!!
        see: https://blogs.windows.com/buildingapps/2016/12/02/symlinks-windows-10/

    H O W   T O :
        WND button >> Developer Settings:
            then check the "Developer mode" radio button (window "For developers")
*/

require("../../../psknode/bundles/pskruntime");
const tir = require('./../../../psknode/tests/util/tir');
const assert = require('double-check').assert;

const domain = 'local';
const agents = ['agent_007'];

const swarm = {
    MySwarm: {
        public: {
            inObj: "object",
            interceptorCollector: "array",
        },

        _safePush: function (n) {
            if (!Array.isArray(this.interceptorCollector)) {
                this.interceptorCollector = [];
            }
            this.interceptorCollector.push(n);
        },

        begin: function (inObj) {
            this.doSomething(inObj);

            var assert = require("double-check").assert;    //scoped to the swarm's phase!
            assert.true(this.inObj === inObj, `Objects don't match! (this.inObj=${this.inObj}) (inObj=${inObj})`);

            // `interceptorCollector` right now: [ 1, 3, 5, 6, 4 ]
            // ...but the interceptor AFTER `begin` will push `2` on array, after `begin` exits!
            this.return(this.interceptorCollector);
        },
        doSomething: function (inObj) {
            this.inObj = inObj;
            this.doSomethingElse(null);
        },
        doSomethingElse: function (err, res) {
            var assert = require("double-check").assert;    //scoped to the swarm's phase!
            assert.equal(err, null, "Error");
        }
    },

    InterceptorSwarm: {
        public: {
            _counter: "int",
        },
        _makeFn: function () {
            if (undefined === this._counter) {
                this._counter = 0;
            }
            var n = ++this._counter;
            return function () {
                this._safePush(n);  //here `this` will refer to the intercepted `MySwarm` object!
            }
        },

        setup: function () {
            $$.interceptor.register('MySwarm', 'begin', 'before', this._makeFn());
            $$.interceptor.register('MySwarm', 'begin', 'after', this._makeFn());
            $$.interceptor.register('MySwarm', 'doSomething', 'before', this._makeFn());
            $$.interceptor.register('MySwarm', 'doSomething', 'after', this._makeFn());
            $$.interceptor.register('MySwarm', 'doSomethingElse', 'before', this._makeFn());
            $$.interceptor.register('MySwarm', 'doSomethingElse', 'after', this._makeFn());

            this.return();
        }
    }
};

assert.callback('test interceptor call order', (done) => {

    tir.addDomain(domain, agents, swarm)
        .launch(6000, () => {
            tir.interact('local', 'agent_007')
                .startSwarm("InterceptorSwarm", "setup")
                .onReturn(() => {
                    // console.log("I N T E R C E P T O R   S E T   F O R   agent_007");
                    tir.interact('local', 'agent_007')
                        .startSwarm("MySwarm", "begin", Date.now() + "just for fun")
                        .onReturn(result => {
                            // console.log("R E S U L T   I S  ", result);
                            assert.true(JSON.stringify(result) === JSON.stringify([1, 3, 5, 6, 4, 2]), "Results don't match");

                            done();
                            tir.tearDown(0);
                        });
                });

        });
}, 4000);
