require("../../../psknode/bundles/pskruntime");
var assert = require("double-check").assert;
var _ = require('lodash');

// console.log($$.interceptor); //just check if it exists

var myFlow = $$.flow.describe("MyFlow", {
    doSomething: function () {
        //etc etc
    }
})();

/* 
var myBeforeInterceptor = function () { }
$$.interceptor.register('MyFlow', 'doSomething', 'before', myBeforeInterceptor);

// WARNING: "Duplicated interceptor for 'global.MyFlow/doSomething/before'"
$$.interceptor.register('MyFlow', 'doSomething', 'before', myBeforeInterceptor);
*/

assert.fail("should_throw_RangeError_because_of_bad_WHEN_param",   //bad parameter: `when`
    function () {
        $$.interceptor.register('MyFlow', 'doSomething', 'AFTER_!@#$', function () { });
    });
    
assert.fail("should_throw_TypeError_because_of_bad_FN_param",      //bad parameter: `fn`
    function () {
        $$.interceptor.register('MyFlow', 'doSomething', 'after', "Jack_Interceptorul");
    });

assert.callback("interceptor_should_catch_arguments_of_intercepted_method", function (done) {
    var mockArguments = [
        1,
        undefined,
        {
            speed: 132.5,
            'timestamp': Date.now()
        },
        [
            222.2,
            null,
            {
                name: 'John',
                'height': 177,
                Bday: {
                    year: 1980,
                    month: 'Dec',
                    day: 31
                }
            },
            false,
            'abc'
        ],
        true,
        (function fct1() {
            var n;
            return function fct2(k) {
                if (!n) {
                    n = mockArguments[2].speed; //132.5
                }
                n += k;
                return n;
            }
        })(),
        x => x + 13,
        new Set(["Alice", "Bob", "Eve"]),
        /Chapter (\d+)\.\d*/,                   //RegExp
        new Error("The end!")                   //DO NOT console.log(mockArguments)!
    ];

    var mockArgumentsTester = function (...actualArguments) {
        assert.true(mockArguments.length === actualArguments.length, "Arguments lenght differs!");

        //we need a deep comparison; [Arguments] { '0': 1, '1': undefined, ... }
        assert.true(_.isEqual(mockArguments, actualArguments), "Arguments values don't match!");
    }

    $$.interceptor.register('MyFlow', 'doSomething', 'before', mockArgumentsTester);
    $$.interceptor.register('MyFlow', 'doSomething', 'after', mockArgumentsTester);
    //done();

    myFlow.doSomething(...mockArguments);
    done();
}/* , 500 */);
