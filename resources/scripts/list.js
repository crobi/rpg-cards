var mv = require('mv');
var fs = require('fs');
var path = require('path');
var walk = require('walk');

var workingdir = __dirname;
if (process.argv[2]) {
    workingdir = path.resolve(__dirname, process.argv[2]);
}
console.log("Working in " + workingdir);

var outputname = "files.txt";
if (process.argv[3]) {
    outputname = process.argv[3];
}
console.log("Working in " + workingdir);

var options = {};
var walker = walk.walk(workingdir, options);

var files = [];

walker.on("file", function (root, fileStats, next) {
    files.push(fileStats.name);
    next();
});

walker.on("errors", function (root, nodeStatsArray, next) {
    console.log("Error on walker");
    next();
});

walker.on("end", function () {
    console.log("Done enumerating files.");

    files.sort();
    var endOfLine = require('os').EOL;
    fs.writeFile(path.resolve(workingdir, outputname), files.join(endOfLine), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("File list saved as " + outputname);
        }
    });
});