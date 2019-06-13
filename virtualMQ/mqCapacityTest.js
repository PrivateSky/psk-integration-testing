/*
* Test virtualMQ capacity
* arg1 - expected queue capacity
* arg2 - amount of time to post messages
* */


require("../../../builds/devel/pskruntime");
require("../../../builds/devel/virtualMQ");
require("../../../builds/devel/psknode");

const utils = require("../../psk-unit-testing/Utils/fileUtils");
const assert = require("double-check").assert;
const VirtualMQ        = require('../../../modules/virtualmq');
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
var minQueueCapacity = args[0] || 4000;
var postCallsTimeout = args[1] || 10000;
var postFlag = true;

//var server = new Server(sslConfig).listen(port);
function createServer(callback) {
    var server = VirtualMQ.createVirtualMQ(port, folder, undefined, (err, res) => {
        if (err) {
            console.log("Failed to create VirtualMQ server on port ", port);
            console.log("Trying again...");
            if (port > 0 && port < 50000) {
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

function createSwarmMessage(msg) {
    return JSON.stringify({
        meta: {
            swarmId: msg
        }
    });
}

var counter = 0;
const options = {
    host: '127.0.0.1',
    port: port,
    path: '/' + CHANNEL_NAME,
    method: 'POST'
};

var req;

// Make a post with a message
function postMessage(message, finish) {


    try {
        req = http.request(options, (res) => {
            const statusCode = res;
            let error;
            if (statusCode >= 400) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            }

            if (error) {
                console.log(error);
                res.destroy();
                return;
            }

            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', ()=>{})
        });

        req.on('error',function(e){
            return;
        });

        counter++;

        req.write(message);
        req.end();
        postMessage(createSwarmMessage('msg_' + counter), finish);

    } catch (e) {
        return;
    }

}


function endAndCleanTest(finish) {
    console.log('Number of post messages sent to virtualMQ is: ', counter, ' expected minimum ', minQueueCapacity);
    assert.true(counter > minQueueCapacity, 'virtualMQ failed after ' + counter + ' post calls');
    utils.deleteFolder(folder);
    finish();
    process.exit(0);

}

function test(finish) {
    setTimeout(() => {
        utils.deleteFolder(folder);
        endAndCleanTest(finish);
    }, postCallsTimeout);
    postMessage(createSwarmMessage('msg_' + counter), finish);
}

createServer((server) => {
    assert.callback("VirtualMQ stress test", test, postCallsTimeout + 1000);
});