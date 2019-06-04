require("../../../builds/devel/pskruntime");
require("callflow");
require("launcher");
var assert = require("double-check").assert;

$$.loadLibrary("testSwarms", "../../../libraries/testSwarms");

var f = $$.swarm.start("testSwarms.keepAliveSwarm");

assert.callback("Keep alive test",function (callback) {
    f.swarm("system", "begin", callback);
})






