require("../../../psknode/bundles/pskruntime");
require("../../../psknode/bundles/psknode");
const bar = require('bar');
const double_check = require("../../../modules/double-check");
const assert = double_check.assert;
const Archive = bar.Archive;
const ArchiveConfigurator = bar.ArchiveConfigurator;
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

double_check.createTestFolder("bar_test_folder", (err, testFolder) => {

    const folderPath = path.join(testFolder, "fld");
    const destinationPath = path.join(testFolder, "dest");
    const filePath = path.join(destinationPath, "fld/a.txt");
    let savePath = path.join(testFolder, "dot");


    const folders = ["fld"].map(folder => path.join(testFolder, folder));
    const files = ["fld/a.txt", "fld/b.txt", "fld/c.txt"].map(file => path.join(testFolder, file));

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

            archive.addFolder(folderPath, destinationPath,(err) => {
                assert.true(err === null || typeof err === "undefined", "Failed to archive file.");

                double_check.deleteFoldersSync(folders);
                assert.true(err === null || typeof err === "undefined", "Failed to delete file");

                archive.extractFile(filePath, filePath, (err) => {
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
});

