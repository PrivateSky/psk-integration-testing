require("../../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const assert = require("../../../modules/double-check").assert;
var fsm = require("../../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dependencyTarget = path.join(testWorkspaceDir, "./demo-git");
var dependencyName = "demo-project";

var tempDir = path.join(testWorkspaceDir, "./git-new-files");

var f = $$.flow.create("commitActionTest", {

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
                    "src": "http://bogdan.baran@docker.heavensolutions.com:50080/bogdan.baran/demo-project-bot.git",
                    "credentials": {
                        "username": "hs.bot",
                        "password": "6z5??JENc>e;]V@8"
                    },
                    "actions": [{
                        "type": "clone",
                        "options": {
                            "depth": "1",
                            "branch": "master"
                        },
                        "target": dependencyTarget
                    }, {
                        "type": "move",
                        "src": `${tempDir}/sub/`,
                        "target": `${dependencyTarget}/${dependencyName}`
                    }, {
                        "type": "commit",
                        "message": "[Auto-Commit] Committed new changes",
                        "target": fsExt.resolvePath(`${dependencyTarget}/${dependencyName}`)
                    }]
                }
            ]
        };
        fileStateManager.saveState([testWorkspaceDir]);

        fsExt.createDir(tempDir);
        fsExt.createDir(`${tempDir}/sub/`);
        fsExt.createFile(`${tempDir}/sub/file1.js`, "alert('test" + Math.floor(Math.random() * Math.floor(100000)) + "')!");
    },

    act: function() {
        $$.callflow.start("deployer.Deployer").run(this.configObject, this.callback);
    },

    clean:function(){
        console.log("Restoring");
        fileStateManager.restoreState();
    },

    callback:function (error, result) {
        assert.notNull(result, "Result should not be null!");
        assert.isNull(error, "Should not be any errors!");
        this.end();
    }
});

assert.callback("commitActionTest", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 3000);
    f.start(end);
});
