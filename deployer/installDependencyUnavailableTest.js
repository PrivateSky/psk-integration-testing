require("../../../engine/core").enableTesting();
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const assert = require("../../../modules/double-check").assert;

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

var fsm = require("../../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dummyTargetWorkDir = fsExt.resolvePath(testWorkspaceDir);
var dummyTargetDir = path.join(testWorkspaceDir, "./node_modules");
var dependencyName = "unavailable";


var f = $$.flow.create("downloadDependencyUnavailable", {
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
                    "workDir": dummyTargetWorkDir,
                    "actions": ["install"]
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

    callback:function (error,result){
        console.log(JSON.stringify(error));
        assert.notNull(error, "Should not be null!" );
        assert.isNull(result, "Result should be null!");
        this.end();
    }
});

assert.callback("downloadDependencyUnavailable", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 7000);
    f.start(end);
},5000);


