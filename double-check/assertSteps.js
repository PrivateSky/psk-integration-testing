const assert = require("../../../modules/double-check").assert;
var arr = [function a (next){
    next();
},
    function b (next){
        next();
    }];

assert.steps("Happy path test", arr);