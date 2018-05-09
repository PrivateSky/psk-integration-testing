require("../../../engine/core").enableTesting();
var fs = require("fs");
var fsm = require("../../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();
const assert = require("../../../modules/double-check").assert;
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dummyTargetDir = path.join(testWorkspaceDir, "./extract");
var dummySrcFile1 = path.join(dummyTargetDir, "acl-magic.zip");

var f = $$.flow.create("extractSourceUnavailable", {
    start:function(end) {
        this.end = end;
        this.beforeExecution();
        this.act();
    },

    beforeExecution:function() {
        this.configObject = {
            "dependencies": [
                {
                    "name": "dummy",
                    "actions": [{
                        "type": "extract",
                        "src": dummySrcFile1,
                        "target": dummyTargetDir
                    }]
                }]
        };
        fileStateManager.saveState([testWorkspaceDir]);
    },

    act:function() {
        $$.callflow.start("deployer.Deployer").run(this.configObject, this.callback);
    },

    clean:function(){
        console.log("restoring");
        fileStateManager.restoreState();
    },

    callback:function (error, result) {
        assert.notNull(error, "Should have errors!");
        assert.isNull(result, "Result should be null!");
        this.end();
    }
});
assert.callback("extractSourceUnavailable", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 7000);
    f.start(end);
},5000);