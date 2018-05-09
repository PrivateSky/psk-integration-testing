require("../../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const assert = require("../../../modules/double-check").assert;
var fsm = require("../../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dummySrcDir = path.join(testWorkspaceDir, "./move-source");
var dummyTargetDirBase = path.join(testWorkspaceDir, "./move-destination");
var dummyTargetDir = `${dummyTargetDirBase}/dummy-dependency`;
var dependencyName = "dummy-dependency";

var f = $$.flow.create("moveActionTest", {
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
                        "src": `${dummySrcDir}/dummy-dependency`,
                        "target": dummyTargetDir
                    }]
                }
            ]
        };
        fileStateManager.saveState([testWorkspaceDir]);
        fsExt.createDir(`${dummySrcDir}`);
        fsExt.createDir(`${dummySrcDir}/dummy-dependency`);
        fsExt.createDir(`${dummySrcDir}/dummy-dependency/sub-dir`);
        fsExt.createFile(`${dummySrcDir}/dummy-dependency/file1.js`, "alert('test1')!");
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
        assert.true(fs.existsSync(targetPath), `[FAIL] Dependency "${dependencyName}" does not exist in ${targetPath}`);
        this.end();

    }
});
assert.callback("moveActionTest", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 1500);
    f.start(end);
});