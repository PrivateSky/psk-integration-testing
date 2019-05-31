require("../../../builds/devel/pskruntime");
require("../../../builds/devel/csbCore");
require("../../../builds/devel/consoleTools");

const assert = require("double-check").assert;
const csbCore = require("csb-core");
const fs = require("fs");
const EDFS = csbCore.EDFS;
const edfs = new EDFS();
const CSBIdentifier = csbCore.CSBIdentifier;

const rootCSB = edfs.getRootCSB(new CSBIdentifier(undefined, "http://localhost:8080"));
const rawCSB = rootCSB.createRawCSB();
const CSBPath = "file1";
const filePath = "./resources/testFile";
const fileStream = fs.createReadStream(filePath);
assert.callback("AddFileTest", (callback) => {
    rootCSB.addFile(CSBPath, fileStream, (err) => {
        if (err) {
            throw err;
        }

        rootCSB.loadFile(CSBPath, (err, fileData) => {
            if (err) {
                throw err;
            }

            assert.notNull(fileData, "Failed to load loadFile");
            callback();
        });

    });
});
