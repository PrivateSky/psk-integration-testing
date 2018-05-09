require("../../../engine/core").enableTesting();
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const assert = require("../../../modules/double-check").assert;

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dummyTargetDir = path.join(testWorkspaceDir, "./checksum-dummy");
var dummyTargetFile = `${dummyTargetDir}/file1.js`;

var f = $$.flow.create("fileChecksum", {
    start:function(end) {
        this.end = end;
        this.beforeExecution();
        this.assert();
    },

    beforeExecution:function() {
        fsExt.createDir(dummyTargetDir);
        fsExt.createFile(dummyTargetFile, "alert('test1')!");
    },

    clean:function(){
        console.log("Cleaning folder", dummyTargetDir);
        fsExt.rmDir(testWorkspaceDir);
    },

    assert: function() {
        let expectedChecksum = "403d91e9d3a8b6ce17435995882a4dba";
        let checksum = fsExt.checksum(dummyTargetFile);
        assert.true(expectedChecksum === checksum, `[FAIL] Checksum was not calculated correctly! The result was ${checksum} and it should have been ${expectedChecksum}!`);
        this.end();
    }
});

assert.callback("fileChecksum", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 1500);
    f.start(end);
});

