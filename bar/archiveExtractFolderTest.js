require("../../../psknode/bundles/pskruntime");
require("../../../psknode/bundles/psknode");
const bar = require('bar');
const double_check = require("../../../modules/double-check");
const assert = double_check.assert;
const Archive = bar.Archive;
const ArchiveConfigurator = bar.ArchiveConfigurator;
const crypto = require("crypto");
const path = require("path");

double_check.createTestFolder("bar_test_folder", (err, testFolder) => {

    const folderPath = path.join(testFolder, "fld");
    let savePath = path.join(testFolder, "dot");


    const folders = ["fld/fld2", "dot"].map(folder => path.join(testFolder, folder));
    const files = ["fld/a.txt", "fld/fld2/b.txt"].map(file => path.join(testFolder, file));

    const text = ["asta e un text", "asta e un alt text"];

    const archiveConfigurator = new ArchiveConfigurator();
    archiveConfigurator.setStorageProvider("FolderBrickStorage", savePath);
    archiveConfigurator.setFsAdapter("FsAdapter");
    archiveConfigurator.setBufferSize(2);
    archiveConfigurator.setMapEncryptionKey(crypto.randomBytes(32));

    const archive = new Archive(archiveConfigurator);

    assert.callback("ArchiveFolderTest", (callback) => {
        double_check.ensureFilesExist(folders, files, text, (err) => {
            assert.true(err === null || typeof err === "undefined", "Failed to create folder hierarchy.");

            double_check.computeFoldersHashes([folderPath], (err, initialHashes) => {
                assert.true(err === null || typeof err === "undefined", "Failed to compute folder hashes.");

                archive.addFolder(folderPath, (err, mapDigest) => {
                    assert.true(err === null || typeof err === "undefined", "Failed to add folder.");
                    assert.true(mapDigest !== null && typeof mapDigest !== "undefined", "Map digest is null or undefined.");

                    double_check.deleteFoldersSync(folderPath);
                    assert.true(err === null || typeof err === "undefined", "Failed to delete folders.");

                    archive.extractFolder(savePath, (err) => {
                        assert.true(err === null || typeof err === "undefined", "Failed to extract folder.");

                        double_check.computeFoldersHashes([folderPath], (err, extractionHashes) => {
                            assert.true(err === null || typeof err === "undefined", "Failed to compute folder hashes.");
                            assert.true(assert.hashesAreEqual(initialHashes, extractionHashes), "Folder hashes do not coincide.");

                            double_check.deleteFoldersSync([folderPath, savePath]);
                            assert.true(err === null || typeof err === "undefined", "Failed to delete folders.");
                            callback();
                        });
                    });
                });
            });
        });
    }, 2000);
});

