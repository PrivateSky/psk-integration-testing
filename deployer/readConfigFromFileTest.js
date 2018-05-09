require("../../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const assert = require("../../../modules/double-check").assert;
var fsm = require("../../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dummyTargetDir = path.join(testWorkspaceDir, "./dummy-config-file-dir");
var dummyConfigFile = fsExt.resolvePath(`${dummyTargetDir}/config.json`);
var dummyDownloadDir = testWorkspaceDir + "/dummy-download-dir";
var dependencyName = "acl.js";

var f = $$.flow.create("readConfigFromTestFile", {
    start:function(end) {
        this.beforeExecution();
        this.act();
        this.end = end;
    },

    beforeExecution:function() {
        fileStateManager.saveState([testWorkspaceDir]);
        fsExt.createDir(dummyTargetDir);
        fsExt.createFile(dummyConfigFile, `
        {
            "dependencies": [
                {
                    "name": "${dependencyName}",
                    "src": "https://raw.githubusercontent.com/PrivateSky/acl-magic/master/lib/acl.js",
                    "actions": [{
                        "type": "download",
                        "target": "${dummyDownloadDir}"
                    }]
                }
            ]
        }`);
    },

    act: function() {
        $$.callflow.start("deployer.Deployer").run(dummyConfigFile, this.callback);
    },

    clean:function(){
        console.log("restoring");
        fileStateManager.restoreState();
    },

    callback: function(error, result) {
        assert.notNull(result, "[FAIL] Reading config from file does not work !");
        assert.isNull(error, "Should not be any errors!");
        let targetPath = fsExt.resolvePath(dummyDownloadDir + "/" +dependencyName );
        assert.true(fs.existsSync(targetPath), `[FAIL] Dependency "${targetPath}" does not exist!`);
        this.end();
    }
});
assert.callback("readConfigFromTestFile", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 1500);
    f.start(end);
});


