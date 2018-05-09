require("../../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const assert = require("../../../modules/double-check").assert;
var fsm = require("../../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dummyTargetWorkDir = fsExt.resolvePath(testWorkspaceDir);
var dummyTargetDir = path.join(testWorkspaceDir, "./node_modules");
var dummyTargetDir2 = path.join(testWorkspaceDir, "./modules");
var dependencyName1 = "transrest";
var dependencyName2 = "whys";


var f = $$.flow.create("installMoveActionTest", {
    start:function(end) {
        this.end = end;
        this.beforeExecution();
        this.act();
    },

    beforeExecution:function() {
        this.configObject = {
            "dependencies": [
                {
                    "name": dependencyName1,
                    "src": "npm",
                    "workDir": dummyTargetWorkDir,
                    "actions": ["install", {
                        "type": "move",
                        "src": path.join(dummyTargetDir, dependencyName1),
                        "target": path.join(dummyTargetDir2, dependencyName1)
                    }]
                },
                {
                    "name": dependencyName2,
                    "src": "npm",
                    "workDir": dummyTargetWorkDir,
                    "actions": ["install", {
                        "type": "move",
                        "src": path.join(dummyTargetDir, dependencyName2),
                        "target": path.join(dummyTargetDir2, dependencyName2)
                    }]
                }
            ]
        };

        fileStateManager.saveState([testWorkspaceDir]);
        fsExt.createDir(dummyTargetDir);
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
        for (let i = 0, len = this.configObject.dependencies.length; i < len; i++) {
            let targetPath = fsExt.resolvePath(this.configObject.dependencies[i].actions[1].target);
            assert.true(fs.existsSync(targetPath), `[FAIL] Dependency "${targetPath}" does not exist!}\n`);
        }
        this.end();
    }
});

assert.callback("installMoveActionTest", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 7000);
    f.start(end);
},5000);

