var mv = require('mv');
var fs = require('fs');
var path = require('path');
var walk = require('walk');

var options = {};
var walker = walk.walk(__dirname, options);

function moveToBase(root, filename, next) {
    var src = path.resolve(root, filename);
    var dest = path.resolve(path.resolve(__dirname, "_all", filename));
    mv(src, dest, function (err) {
        if (err) {
            console.log("Error moving "+ root + src + " to " + dest);
        }
        next();
    });
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