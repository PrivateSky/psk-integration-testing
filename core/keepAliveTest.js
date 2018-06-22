require("../../../engine/core").enableTesting();
var assert = $$.requireModule("double-check").assert;

$$.requireLibrary("testSwarms", "testSwarms");

var f = $$.swarm.create("testSwarms.keepAliveSwarm");
assert.callback("Keep alive test",function (callback) {
    f.swarm("system","begin",callback);
})






