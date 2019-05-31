require("../../../builds/devel/pskruntime");
require("../../../builds/devel/csbCore");
require("../../../builds/devel/consoleTools");

const assert = require("double-check").assert;
const csbCore = require("csb-core");
const EDFS = csbCore.EDFS;
const edfs = new EDFS();
const CSBIdentifier = csbCore.CSBIdentifier;

const rootCSB = edfs.getRootCSB(new CSBIdentifier(undefined, "http://localhost:8080"));
const rawCSB = rootCSB.createRawCSB();
const asset = rawCSB.getAsset("global.CSBReference", "csb1");
rawCSB.saveAsset(asset);

// assert.callback("RootCSBTest", (callback) => {
//     rootCSB.saveRawCSB(rawCSB, "", (err) => {
//         if (err) {
//             throw err;
//         }
//
//         console.log("Enough from the clown");
//         rootCSB.loadRawCSB("", (err, newRawCSB) => {
//             if (err) {
//                 throw err;
//             }
//
//             console.log("Loaded Raw CSB", newRawCSB.blockchain.currentValues);
//             // assert.notNull(newRawCSB, "Failed to load RawCSB");
//         });
//     });
// });

console.log("rawCSB", rawCSB);
rootCSB.saveRawCSB(rawCSB, "", (err) => {
    if (err) {
        throw err;
    }

    console.log("Saved raw CSB");
    rootCSB.loadAssetFromPath("csb1", (err, CSBReference) => {
        if (err) {
            throw err;
        }

        console.log("Assset", CSBReference)
    })
});
