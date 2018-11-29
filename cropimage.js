var gm = require('gm');
var fs = require('fs');
//var gm = require('gm').subClass({imageMagick: true});

gm('/original2.png')
    .size(function (err, size) {
        if (err) return console.dir(arguments);
        console.log(size.width > size.height ? 'wider' : 'taller than you');
    });

gm('/original2.png')
    .resize('200', '200', '^')
    .gravity('Center')
    .crop('200', '200')
    .noProfile()
    .write("/crop.png", function(err) {
        console.log(err || "done");
    }
);
