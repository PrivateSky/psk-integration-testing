require("../../../psknode/bundles/pskruntime");
require("../../../psknode/bundles/psknode");
const bar = require('bar');
const double_check = require("../../../modules/double-check");
const assert = double_check.assert;
const Archive = bar.Archive;
const ArchiveConfigurator = bar.ArchiveConfigurator;
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

double_check.createTestFolder("bar_test_folder", (err, testFolder) => {

    const folderPath = path.join(testFolder, "fld");
    let savePath = path.join(testFolder, "dot");
    let additionalStoragePath = path.join(testFolder, "aux");

    const folders = ["fld/fld2"].map(folder => path.join(testFolder, folder));
    const files = ["fld/a.txt", "fld/fld2/b.txt"].map(file => path.join(testFolder, file));

    const text = ["asta e un text", "asta e un alt text"];

    const fileBrickStorage = bar.createFileBrickStorage(additionalStoragePath);

    const archiveConfigurator = new ArchiveConfigurator();
    archiveConfigurator.setStorageProvider("FileBrickStorage", savePath);
    archiveConfigurator.setFsAdapter("FsAdapter");
    archiveConfigurator.setBufferSize(2);
    archiveConfigurator.setMapEncryptionKey(crypto.randomBytes(32));

    const archive = new Archive(archiveConfigurator);

    assert.callback("Clone Bar Test", (callback) => {
        double_check.ensureFilesExist(folders, files, text, (err) => {
            assert.true(err === null || typeof err === "undefined", "Failed to create folder hierarchy.");

            double_check.computeFoldersHashes([folderPath], (err, initialHashes) => {
                assert.true(err === null || typeof err === "undefined", "Failed to compute folder hashes.");

                archive.addFolder(folderPath, (err, mapDigest) => {
                    assert.true(err === null || typeof err === "undefined", "Failed to add folder.");

                    double_check.deleteFoldersSync(folderPath);
                    assert.true(err === null || typeof err === "undefined", "Failed to delete folders.");

                    archive.clone(fileBrickStorage, true, (err) => {
                        assert.true(err === null || typeof err === "undefined", "Failed to clone archive.");

                        archive.extractFolder(additionalStoragePath, (err) => {
                            assert.true(err === null || typeof err === "undefined", "Failed to extract folder.");

                            double_check.computeFoldersHashes([folderPath], (err, extractionHashes) => {
                                assert.true(err === null || typeof err === "undefined", "Failed to compute folder hashes.");
                                assert.true(assert.hashesAreEqual(initialHashes, extractionHashes), "Folder hashes do not coincide.");

                                double_check.deleteFoldersSync(folderPath);
                                fs.unlinkSync(savePath);
                                fs.unlinkSync(additionalStoragePath);
                                assert.true(err === null || typeof err === "undefined", "Failed to delete folders.");
                                callback();
                            });
                        });
                    });
                });
            });
        });
    }, 2000);
});

