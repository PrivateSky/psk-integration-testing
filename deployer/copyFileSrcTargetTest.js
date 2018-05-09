require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
var fsm = require("../../../libraries/utils/FileStateManager");
var srcChecksumBeforeAction;
var fileStateManager = fsm.getFileStateManager();

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dummySrcDir = path.join(testWorkspaceDir, "./copy-source");
var dummyTargetDir = path.join(testWorkspaceDir, "./copy-destination");
var dependencyName = "/";


var f = $$.flow.create("copyFileSrcTargetTest", {
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
                    "src": dummySrcDir,
                    "actions": [{
                        "type": "copy",
                        "target": dummyTargetDir
                    }]
                }
            ]
        };
        fileStateManager.saveState([testWorkspaceDir]);
        fsExt.createDir(dummySrcDir);
        fsExt.createFile(`${dummySrcDir}/file1.js`, "alert('test1')!");
        fsExt.createDir(`${dummySrcDir}/sub-dir`);
        fsExt.createFile(`${dummySrcDir}/sub-dir/file2.js`, "alert('test2')!");
        fsExt.createDir(dummyTargetDir);
        srcChecksumBeforeAction = fsExt.checksum(dummySrcDir);
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
        let targetChecksum = fsExt.checksum(dummyTargetDir);
        assert.true(targetChecksum === srcChecksumBeforeAction, `[FAIL] Files were changed by copy action. Source checksum is ${srcChecksumBeforeAction}, target checksum is ${targetChecksum}`);
        this.end();

    }
});
assert.callback("copyFileSrcTargetTest", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 1500);
    f.start(end);
});


