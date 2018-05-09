require("../../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const assert = require("../../../modules/double-check").assert;
var fsm = require("../../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dummyTargetDir = path.join(testWorkspaceDir, "./save-state-dummy");

var f = $$.flow.create("saveState", {
    start: function (end) {
        this.end = end;
        this.beforeExecution();
        this.act();
        this.assert();
    },

    beforeExecution: function () {
        fsExt.createDir(dummyTargetDir);
        fsExt.createFile(`${dummyTargetDir}/file1.js`, "alert('test1')!");
        fsExt.createDir(`${dummyTargetDir}/sub-dir`);
        fsExt.createFile(`${dummyTargetDir}/sub-dir/file2.js`, "alert('test2')!");
    },

    act: function () {
        fileStateManager.saveState([testWorkspaceDir]);
        fsExt.rmDir(dummyTargetDir);
        fileStateManager.restoreState();
    },

    clean:function(){
        console.log("restoring");
        fsExt.rmDir(testWorkspaceDir);
    },

    assert: function () {
        let dirPath = fsExt.resolvePath(dummyTargetDir);
        assert.true(fs.existsSync(dirPath), `[FAIL] Dir "${dirPath}" does not exist after restore!`);
        this.end();
    }
});

assert.callback("saveState", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 1500);
    f.start(end);
});



