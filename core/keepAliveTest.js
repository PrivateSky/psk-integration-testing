require("../../../engine/core").enableTesting();
var assert = $$.requireModule("double-check").assert;

$$.loadLibrary("keepAliveLib", "keepAliveLib");

var f = $$.swarm.create("keepAliveLib.simpleSwarm");
assert.callback("Keep alive test",function (callback) {
    f.swarm("system","begin",callback);
})






