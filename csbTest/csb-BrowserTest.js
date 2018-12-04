    require("callflow");
    psknodeRequire("pskwallet");

    const textFile = "Some wonderful text that should be saved!Rafael";
    const filePath = "/local/temp.txt";
    const fs = require("fs");
    let csbDefaultPin  = "12345678";
    let csbName = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    let csbAlias = "masta";
    var is = require("interact").createInteractionSpace();

    is.startSwarm("pskwallet.createCsb", "start", csbName).on({
        readPin: function (noTries, defaultPin, isMasterCsb) {
            var self = this;
            if (isMasterCsb) {
                self.swarm("createMasterCsb", defaultPin);
            }else{
                self.swarm("createCsb",csbDefaultPin);
            }
        },
        printSensitiveInfo: function (seed, defaultPin) {
            console.log("Seed: ", seed.toString("base64"));
            console.log("Pin: ", defaultPin)
        },
        onError: function (err) {
            console.log(err);
        },
        printInfo:function(info){
            console.log(info);
            fs.writeFile(filePath,textFile, function(err){
                if(err){
                    console.log(err);
                    return;
                }
                storeFileInCsb(filePath, csbName, csbAlias);
            })

        }
    });

    function storeFileInCsb(filePath, csbName, csbAlias){
        let url = csbName+"/"+csbAlias;
        console.log("Storing url: ",url);
        is.startSwarm("pskwallet.addFile","start",url, filePath).on({
            readPin:function(noTries){
                console.log("readingPin");
                this.swarm("validatePin", csbDefaultPin, noTries);
            },
            printError:function(error){
                console.log(error);
            },
            printInfo:function(info){
                console.log(info);
                extractFileFromCsb(url);
            }
        });
    }

    function extractFileFromCsb(url){
        is.startSwarm("pskwallet.extract","start", url).on({
            readPin:function(noTries){
                let pin = "12345678";
                this.swarm("validatePin", pin, noTries);
            },
            handleError:function(error){
                console.log(error);
            },
            printInfo:function(info){
                console.log(info);

                fs.readFile("/temp.txt",function(err,data){
                    console.log(data.toString());
                })
            }
        })
    }


setTimeout(function () {

    var fs = require("fs");

    fs.readdir("/Adiacent", function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            let files = data.toString().split(",");
            files.forEach(function(file){
                fs.readFile("/Adiacent/"+file, function(err,data){
                    if(err){
                        console.log(err)
                    }else{
                        console.log(file);
                    }
                })
            })
        }
    })

}, 1);

setTimeout(function () {

    var is = require("interact").createInteractionSpace();
    is.startSwarm("createCsb", "start", "mastaleru").on({
        readPin: function (value) {
            console.log("Some value:", value);
            let password = "123456789";
            this.swarm("validatePin", password);
        },
    });
},2000);




