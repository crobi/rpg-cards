const fs = require('fs');
const fse = require('fs-extra');
const request = require('request');
const path = require('path');
const yauzl = require("yauzl");

const downloadUrl = "https://github.com/seiyria/gameicons-font/archive/master.zip";
const tempDir = "./temp";
const tempFilePath = tempDir + "/temp" + Date.now() + ".zip";
const cssFileName = "game-icons.css";
const eotFileName = "game-icons.eot";
const ttfFileName = "game-icons.ttf";
const woffFileName = "game-icons.woff";
const destDir = "./generator/fonts";

// ----------------------------------------------------------------------------
// Download
// ----------------------------------------------------------------------------
function downloadFile(url, dest) {
    console.log("  Downloading...");
    return new Promise((resolve, reject) => {
        request(url)
            .pipe(fs.createWriteStream(dest))
            .on("close", resolve)
            .on("error", reject);
    });
}

// ----------------------------------------------------------------------------
// Unzip
// ----------------------------------------------------------------------------
function unzipAll(src, dest) {
    console.log("  Unzipping...");
    return new Promise((resolve, reject) => {
        yauzl.open(src, {lazyEntries: true}, function(err, zipfile) {
            if (err) {
                reject(err);
                return;
            }
            zipfile.readEntry();
            zipfile.on("entry", function(entry) {
                if (/\/$/.test(entry.fileName)) {
                    // Directory file names end with '/'. Note that entries for
                    // directories themselves are optional. An entry's fileName
                    // implicitly requires its parent directories to exist.
                    zipfile.readEntry();
                } else {
                    var entryPath = path.parse(entry.fileName);
                    var fileName = entryPath.base;
                    var targetFile = path.join(dest, fileName);
                    var i = 2;
                    while (true) {
                        if (!fs.existsSync(targetFile)) {
                            break;
                        }
                        fileName = entryPath.name + "-" + i++ + entryPath.ext;
                        targetFile = path.join(dest, fileName);
                    }
                    zipfile.openReadStream(entry, function(err, readStream) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        readStream
                            .on("end", function() {
                                zipfile.readEntry();
                            }).pipe(
                                fs.createWriteStream(targetFile)
                                    .on("error", reject)
                            ).on("error", reject);
                    });
                }
            }).on("close", resolve);
        });
    });
}

// ----------------------------------------------------------------------------
// Copy
// ----------------------------------------------------------------------------
function cleanDirectory(src) {
    console.log("  Cleaning...");
    return new Promise((resolve, reject) => {
        fse.emptyDir(src, (err) => {
            if (err) { reject(); return; }
            resolve();
        });
    }); 
}

function moveFile(src, dst) {
    console.log("  Moving file...");
    return new Promise((resolve, _) => {
        fse.move(src, dst, () => resolve());
    }); 
}

function removeFile(filePath) {
    console.log("  Removing file...");
    return new Promise((resolve, _) => {
        fse.remove(filePath, () => resolve());
    }); 
}

function copyAll(src, dest) {
    console.log("  Copying...");
    return new Promise((resolve, reject) => {
        fse.copy(src, dest, err => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

function moveAll(src, dest) {
    console.log("  Moving...");
    return new Promise((resolve, reject) => {
        fse.move(src, dest, err => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

fse.emptyDir(tempDir)
    .then(() => console.log("Fonts: start"))
    .then(() => cleanDirectory(tempDir))
    .then(() => downloadFile(downloadUrl, tempFilePath))
    .then(() => unzipAll(tempFilePath, tempDir))
    .then(() => cleanDirectory(destDir))
    .then(() => moveFile(tempDir+"/"+cssFileName, destDir+"/"+cssFileName))
    .then(() => moveFile(tempDir+"/"+eotFileName, destDir+"/"+eotFileName))
    .then(() => moveFile(tempDir+"/"+ttfFileName, destDir+"/"+ttfFileName))
    .then(() => moveFile(tempDir+"/"+woffFileName, destDir+"/"+woffFileName))
    .then(() => cleanDirectory(tempDir))
    .then(() => console.log("Fonts: done"))
    .catch(err => console.log("Fonts: error", err));
