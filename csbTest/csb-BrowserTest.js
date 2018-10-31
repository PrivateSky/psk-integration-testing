setTimeout(function () {

    var is = require("interact").createInteractionSpace();
    is.startSwarm("pskwallet.createCsb", "start", "tralwala").on({
        readPin: function (noTries, defaultPin, isMasterCsb) {
            var self = this;
            if (isMasterCsb) {
                self.swarm("createMasterCsb", defaultPin);
            }
        },
        printSensitiveInfo: function (seed, defaultPin) {
            console.log("Seed: ", seed.toString());
            console.log("Pin: ", defaultPin)
        },
        onError: function (err) {
            console.log(err);
        },
        printInfo:function(info){
            console.log(info);
        }

    });
}
, 500);


setTimeout(function () {

    var fs = require("fs");

    fs.readdir("/", function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(data.toString());
        }
    });

    fs.readdir("/.privateSky", function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(data.toString());
        }
    })

}, 9500);




