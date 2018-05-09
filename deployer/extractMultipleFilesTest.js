require("../../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const assert = require("../../../modules/double-check").assert;
var fsm = require("../../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dependencyOne = "acl-magic.zip";
var dependencyTwo = "pdscore-master.zip";
var dummyTargetDir = path.join(testWorkspaceDir, "./extract");
var dummyTargetDirMagic = path.join(dummyTargetDir, "acl-magic");
var dummyTargetDirPdscore = path.join(dummyTargetDir, "pdscore-master");
var dummySrcFileOne = path.join(dummyTargetDir, "acl-magic.zip");
var dummySrcFileTwo = path.join(dummyTargetDir, "pdscore-master.zip");

var f = $$.flow.create("extractMultipleFiles", {
    start:function(end) {
        this.end = end;
        this.beforeExecution();
        this.act();
    },

    beforeExecution:function() {
        this.configObject = {
            "dependencies": [
                {
                    "name": dependencyOne,
                    "src": "https://github.com/PrivateSky/acl-magic/archive/master.zip",
                    "actions": [{
                        "type": "download",
                        "target": dummyTargetDir
                    }, {
                        "type": "extract",
                        "src": dummySrcFileOne,
                        "target": dummyTargetDirMagic
                    }]
                },
                {
                    "name": dependencyTwo,
                    "src": "https://github.com/PrivateSky/pdscore/archive/master.zip",
                    "actions": [{
                        "type": "download",
                        "target": dummyTargetDir
                    }, {
                        "type": "extract",
                        "src": dummySrcFileTwo,
                        "target": dummyTargetDirPdscore
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
        assert.notNull(result, "Should not be null!");
        assert.isNull(error, "Should not be any errors!");
        let targetPathMagic = fsExt.resolvePath(dummyTargetDirMagic);
        let targetPathPdscore = fsExt.resolvePath(dummyTargetDirPdscore);
        assert.true(fs.existsSync(targetPathMagic) && fs.existsSync(targetPathPdscore), `[FAIL] Dependency does not exist in ${targetPathPdscore} and ${targetPathMagic}`);
        this.end();
    }

});
assert.callback("extractMultipleFiles", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 5000);
    f.start(end);
},7000);