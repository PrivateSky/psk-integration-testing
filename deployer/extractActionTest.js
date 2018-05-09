require("../../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const assert = require("../../../modules/double-check").assert;
var fsm = require("../../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dummyTargetDir = path.join(testWorkspaceDir, "./extract");
var dummyTargetDir2 = path.join(dummyTargetDir, "acl-magic");
var dummySrcFile2 = path.join(dummyTargetDir, "acl-magic.zip");
var dependencyName = "acl-magic.zip";


var f = $$.flow.create("extractActionTest", {
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
                    "src": "https://github.com/PrivateSky/acl-magic/archive/master.zip",
                    "actions": [{
                        "type": "download",
                        "target": dummyTargetDir
                    }, {
                        "type": "extract",
                        "src": dummySrcFile2,
                        "target": dummyTargetDir2
                    }]
                }
            ]
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
        assert.notNull(result, "Result should not be null!");
        assert.isNull(error, "Should not be any errors!");
        let targetPath = fsExt.resolvePath(dummyTargetDir2);
        assert.true(fs.existsSync(targetPath), `[FAIL] Dependency does not exist in ${targetPath}`);
        this.end();
    }
});
assert.callback("extractActionTest", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 7000);
    f.start(end);
},5000);