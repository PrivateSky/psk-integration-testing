require("../../../engine/core").enableTesting();
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const assert = require("../../../modules/double-check").assert;
var fsm = require("../../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dummyTargetDir = path.join(testWorkspaceDir, "./checksum-dummy");
var dummyTargetFile = `${dummyTargetDir}/file1.js`;

var f = $$.flow.create("missingExpectedChecksum", {
    start:function(end) {
        this.end = end;
        this.beforeExecution();
        this.act();
    },

    beforeExecution:function() {
        this.configObject = {
            "dependencies": [
                {
                    "name": "file1.js",
                    "actions": [{
                        "type": "checksum",
                        "src": dummyTargetFile,
                        "expectedChecksum": null,
                        "algorithm": "md5",
                        "encoding": "hex"
                    }]
                }
            ]
        };

        fileStateManager.saveState([testWorkspaceDir]);
        fsExt.createDir(dummyTargetDir);
        fsExt.createFile(dummyTargetFile, "alert('test1')!");
    },

    act: function() {
        $$.callflow.start("deployer.Deployer").run(this.configObject, this.assert);
    },

    clean:function(){
        console.log("restoring");
        fileStateManager.restoreState();
    },

    assert: function(error, result) {
        assert.notNull(error, "Expected checksum attribute not set!");
        assert.isNull(result, "Should not be any errors!");
        this.end();
    }

});
assert.callback("missingExpectedChecksum", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 1500);
    f.start(end);
});




