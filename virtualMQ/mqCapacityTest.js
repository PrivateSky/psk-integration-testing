/*
* Test virtualMQ capacity
* arg1 - expected queue capacity
* arg2 - amount of time to post messages
* */


require("../../../builds/devel/pskruntime");
require("../../../builds/devel/virtualMQ");
require("../../../builds/devel/psknode");

const utils = require("../../psk-unit-testing/Utils/virtualMQUtils");
const assert = require("double-check").assert;
const VirtualMQ = require('../../../modules/virtualmq');
const CHANNEL_NAME = Buffer.from('testChannel').toString('base64');
const fs = require("fs");
const http = require("http");
var folder;


try {
    folder = fs.mkdtempSync("testFile");
} catch (err) {
    console.log("Failed to create tmp directory");
}

let port = 8092;
const args = process.argv.slice(2);
var maxQueueCapacity = args[0] || 0;
var waitStrutureTimeout = 5000;
var nrOfSeconds = 5;
var postCallsTimeout = args[1] || waitStrutureTimeout+nrOfSeconds*1000;

var expectedMin = 450;
var postFlag = true;

//var server = new Server(sslConfig).listen(port);
function createServer(callback) {
    var server = VirtualMQ.createVirtualMQ(port, folder, undefined, (err, res) => {
        if (err) {
            console.log("Failed to create VirtualMQ server on port ", port);
            console.log("Trying again...");
            if (port > 1024 && port < 50000) {
                port++;
                createServer(callback);
            } else {
                console.log("There is no available port to start VirtualMQ instance need it for test!");
            }
        } else {
            console.log("Server ready and available on port ", port);
            callback(server);
        }
    });
}

function createSwarmMessage(msg, finish) {
    return JSON.stringify({
        meta: {
            swarmId: msg
        }
    });
}


const options = {
    host: '127.0.0.1',
    port: port,
    path: '/' + CHANNEL_NAME,
    method: 'POST'
};

var maxCounter = 0;
var req;
var myInterval;
var remaining;
var start, end;

function getDefaultMQCapacity(msg, finish) {
    req = http.request(options, (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
            rawData += chunk;
        });
        res.on('end', () => {
            maxQueueCapacity = res.headers['x-ratelimit-limit'];
            var postRequestsArr = [];
            let messages = [];

            //prepare bulk of requests
            for (let i = 0; i < maxQueueCapacity * 2; i++) {
                messages.push(createSwarmMessage(i));
            }
            //-----------

            //try to flood the queue per second
            //wait 5 sec to finish creating folder structure
            var counter = 0;
            setTimeout(()=>{

                start = (new Date()).getTime();
                setInterval(()=>{
                    for (let j = 0; j < 50; j++) {
                        try {
                            counter++;
                            postMessage(messages[j]);


                        } catch (e) {
                            console.log('-------------', counter, ' -------------- ', j, ' eeeeee', e);
                            break;
                        }

                    }
                },1);
            }, waitStrutureTimeout);


                //postMessage(createSwarmMessage('msg_' + counter), finish)

        });
    });

    req.on('error', function (e) {
        return;
    });

    req.write(msg);
    req.end();

}

// Make a post with a message
function postMessage(message) {

    req = http.request(options, (res) => {
        const statusCode = res;
        end = (new Date()).getTime();
        maxCounter++;
        remaining = Number(res.headers['x-ratelimit-remaining']);
        if (res.statusCode != 201) {
            res.resume();
            return 'the ID IS ' + JSON.parse(message).meta['swarmId'];
        }

        let rawData = '';
        res.on('data', (chunk) => {
            rawData += chunk;
        });
        res.on('end', () => {
        })
    });

    req.on('error', function (e) {
        e.swarmId = JSON.parse(message).meta['swarmId'];
        e.maxCounter = maxCounter;
        e.remaining = remaining;
        e.starTime = start;
        e.endTime = end;
        e.totalTime = end - start;

        throw e;


    });
    req.write(message);
    req.end();

}


function endAndCleanTest(finish) {
    console.log('Number of post messages sent to virtualMQ per second is: ', maxCounter/nrOfSeconds, ' total time ', end - start);

    assert.true(maxCounter > expectedMin*nrOfSeconds, 'virtualMQ failed after ' + maxCounter + ' post calls');
    utils.deleteFolder(folder);
    finish();
    process.exit(0);

}

function test(finish) {
    getDefaultMQCapacity(createSwarmMessage('msg'), finish);
    process.on
    (
        'uncaughtException',
        function (err) {
            console.log('MQ Fail ', err);
            utils.deleteFolder(folder);
            process.exit(0);
        }
    );

    setTimeout(() => {
        utils.deleteFolder(folder);
        endAndCleanTest(finish);
    }, postCallsTimeout);


}

createServer((server) => {

    assert.callback("VirtualMQ stress test", test, postCallsTimeout + 1000);
});