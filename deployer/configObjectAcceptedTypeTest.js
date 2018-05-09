require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

var configObject = [[], {}, true, undefined, null, function(){}];
var errors = [];

for(var i = 0; i < configObject.length; i++ ) {
    $$.callflow.start("deployer.Deployer").run(configObject[i], callback);
}

function callback(error, result) {
    var testFailed = false;
    var message = "";
    if(error) {
        errors.push(error);
        message = "[FAIL] " + JSON.stringify(error);
    } else {
        console.log(JSON.stringify(result));
    }
    let logger = testFailed ? console.error : console.log;
    logger(message);
};


setTimeout(function(){
    assert.pass("configObjectAcceptedTypeTest", function() {
        if(errors.length != configObject.length) {
            throw "Not all negative scenarios of config object has passed!"
        }
    })
}, 2000);
