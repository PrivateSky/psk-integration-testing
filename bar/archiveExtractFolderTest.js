require("../../../psknode/bundles/pskruntime");
require("../../../psknode/bundles/psknode");
const bar = require('bar');
const double_check = require("../../../modules/double-check");
const assert = double_check.assert;
const Archive = bar.Archive;
const ArchiveConfigurator = bar.ArchiveConfigurator;
const fs = require("fs");
const crypto = require("crypto");

const folderPath = "fld";

const folders = ["fld/fld2", "dot"];
const files = [
    "fld/a.txt", "fld/fld2/b.txt"
];

const text = ["asta e un text", "asta e un alt text"];
let savePath = "dot";

const archiveConfigurator = new ArchiveConfigurator();
archiveConfigurator.setStorageProvider("FolderBrickStorage", savePath);
archiveConfigurator.setFsAdapter("FsAdapter");
archiveConfigurator.setBufferSize(2);
archiveConfigurator.setEncryptionAlgorithm("aes-256-cbc");
archiveConfigurator.setCompressionAlgorithm("gzip");

const encryptionKey = require("crypto").randomBytes(32);
const archive = new Archive(archiveConfigurator, encryptionKey);

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

