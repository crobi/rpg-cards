var mv = require('mv');
var fs = require('fs');
var path = require('path');
var walk = require('walk');

var workingdir = __dirname;
if (process.argv[2]) {
    workingdir = path.resolve(__dirname, process.argv[2]);
}
console.log("Working in " + workingdir);

var options = {};
var walker = walk.walk(workingdir, options);

function moveToBase(root, filename, next) {
    var src = path.resolve(root, filename);
    var dest = path.resolve(workingdir, filename);
    if (src == dest) {
        next();
    } else {
        mv(src, dest, function (err) {
            if (err) {
                console.log("Error moving "+ src + " to " + dest);
            }
            next();
        });
    }
}

walker.on("file", function (root, fileStats, next) {
    moveToBase(root, fileStats.name, next);
});

walker.on("errors", function (root, nodeStatsArray, next) {
    console.log("Error on walker");
    next();
});

walker.on("end", function () {
    console.log("all done");
});