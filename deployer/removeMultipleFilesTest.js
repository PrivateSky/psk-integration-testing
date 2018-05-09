require("../../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;

const assert = require("../../../modules/double-check").assert;
var fsm = require("../../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dummyTargetDir = path.join(testWorkspaceDir, "./remove-source");
var dummyTargetFile =  path.join(testWorkspaceDir, "./toDelete.js");
var dependencyName = "dummy-dependency";

var f = $$.flow.create("removeMultipleFiles", {
    start:function(end) {
        this.end = end;
        this.beforeExecution();
        this.act();
    },

    beforeExecution:function() {
        this.configObject = {
            "dependencies": [
                {
                    "name": dependencyName,
                    "src": "npm",
                    "actions": [{
                        "type": "remove",
                        "target": dummyTargetDir
                    }]
                },
                {
                    "name": dependencyName,
                    "src": "npm",
                    "actions": [{
                        "type": "remove",
                        "target": dummyTargetFile
                    }]
                }
            ]
        };
        fileStateManager.saveState([testWorkspaceDir]);
        fsExt.createDir(dummyTargetDir);
        fsExt.createFile(dummyTargetFile, "alert('test1')!");
    },

    act:function() {
        $$.callflow.start("deployer.Deployer").run(this.configObject, this.callback);
    },

    clean:function(){
        console.log("restoring");
        fileStateManager.restoreState();
    },

    callback:function (error, result) {
        assert.notNull(result, "Result should not be null!");
        assert.isNull(error, "Should not be any errors!");
        let targetPathDir = fsExt.resolvePath(dummyTargetDir);
        let targetPathFile = fsExt.resolvePath(dummyTargetFile);
        assert.true(!fs.existsSync(targetPathDir) && !fs.existsSync(targetPathFile), `[FAIL] Dependencies ${targetPathDir} and ${targetPathFile} still exists!`);
        this.end();
    }
});
assert.callback("removeMultipleFiles", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 1500);
    f.start(end);
})