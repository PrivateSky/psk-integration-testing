process.env.DEPLOYER_DEBUG = true;
require("../../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const assert = require("../../../modules/double-check").assert;
var fsm = require("../../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dummySrcDir = path.join(testWorkspaceDir, "./move-source/dummy-dependency");
var dummyTargetDir = path.join(testWorkspaceDir, "./move-destination");
var dependencyName = "dummy-dependency";

var f = $$.flow.create("moveActionOverwriteTest", {
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
                        "type": "move",
                        "src": dummySrcDir,
                        "target": dummyTargetDir,
                        "options": {
                            "overwrite": false
                        }
                    }]
                }
            ]
        };
        fileStateManager.saveState([testWorkspaceDir]);
        fsExt.createDir(`${dummySrcDir}`);
        fsExt.createFile(`${dummySrcDir}/file1.js`, "alert('test1')!");
        fsExt.createDir(`${dummyTargetDir}`);
        fsExt.createDir(`${dummyTargetDir}/dummy-dependency`);
        fsExt.createFile(`${dummyTargetDir}/dummy-dependency/file1.js`, "alert('test2')!");

        this.sourceChecksum = fsExt.checksum(dummySrcDir);

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
        let targetPath = fsExt.resolvePath(dummyTargetDir);
        destinationChecksum = fsExt.checksum(`${dummyTargetDir}/dummy-dependency`);
        assert.false(destinationChecksum == this.sourceChecksum , `[FAIL] Dependency "${targetPath}" was not overwritten!`);
        this.end();

    }
});

assert.callback("moveActionOverwriteTest", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 1500);
    f.start(end);
});