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
const filePath = "fld/a.txt";
let savePath = "dot";


const folders = ["fld"];
const files = [
    "fld/a.txt", "fld/b.txt", "fld/c.txt"
];

const text = ["asta e un text?", "ana are mere", "hahahaha"];

const archiveConfigurator = new ArchiveConfigurator();
archiveConfigurator.setStorageProvider("FileBrickStorage", savePath);
archiveConfigurator.setFsAdapter("FsAdapter");
archiveConfigurator.setBufferSize(2);
archiveConfigurator.setMapEncryptionKey(crypto.randomBytes(32));

const archive = new Archive(archiveConfigurator);

assert.callback("AddFolderExtractFile", (callback) => {
    double_check.ensureFilesExist(folders, files, text, (err) => {
        assert.true(err === null || typeof err === "undefined", "Failed to create folder hierarchy.");

        archive.addFolder(folderPath, (err) => {
            assert.true(err === null || typeof err === "undefined", "Failed to archive file.");

            double_check.deleteFoldersSync(folders);
            assert.true(err === null || typeof err === "undefined", "Failed to delete file");

            archive.extractFile(filePath, (err) => {
                if (err) {
                    throw err;
                }
                assert.true(err === null || typeof err === "undefined", "Failed to extract file.");

                double_check.deleteFoldersSync(folders);

                fs.unlink(savePath, (err) => {
                    assert.true(err === null || typeof err === "undefined", "Failed to delete file " + savePath);

                    callback();
                });
            });
        });
    });
}, 1500);

