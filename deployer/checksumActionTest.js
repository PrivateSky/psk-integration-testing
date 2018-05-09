require("../../../engine/core").enableTesting();
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const assert = require("../../../modules/double-check").assert;

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dummyTargetDir = path.join(testWorkspaceDir, "./checksum-dummy");
var dummyTargetFile = `${dummyTargetDir}/file1.js`;


var f = $$.flow.create("checksumActionTest", {
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
                        "expectedChecksum": "403d91e9d3a8b6ce17435995882a4dba",
                        "algorithm": "md5",
                        "encoding": "hex"
                    }]
                }
            ]
        };

        fsExt.createDir(dummyTargetDir);
        fsExt.createFile(dummyTargetFile, "alert('test1')!");
    },
    act: function() {
        $$.callflow.start("deployer.Deployer").run(this.configObject, this.check);
    },
    clean:function(){
        console.log("Cleaning folder", testWorkspaceDir);
        fsExt.rmDir(testWorkspaceDir);
    },
    check: function(error, result) {
        assert.notNull(result, "Checksum did not match!");
        assert.isNull(error, "Should not be any errors!");
        this.end();
    }

});
assert.callback("checksumActionTest", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 1500);
    f.start(end);
});