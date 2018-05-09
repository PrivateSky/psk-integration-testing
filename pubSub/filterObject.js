require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
var channelName = "superFunChannel";
var registered = {region:"europe", topic:"edu"};
var received = [];
var sent = ["It works!"];


var f = $$.flow.create("filterObject-withStringify",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channelName, this.callback, null, this.filter);
        this.publish({msg:"It works!", filter:{region:"europe", topic:"edu"}});
        this.publish({msg:"Message on edu topic(Europe)!", filter:{topic:"edu", region:"europe"}});
        setTimeout(this.test, 1000);
    },
    publish:function(message) {
        soundPubSub.publish(channelName, message);
    },
    filter:function (message) {
        return JSON.stringify(message.filter) === JSON.stringify(registered);
    },
    callback:function(message){
        received.push(message.msg);
    },
    test :function () {
        assert.true(sent.length == 1, "Size should be 1 but it is"+sent.length);
        assert.true(sent.length === received.length, "Something happened with the messages array size");
        for(var i = 0; i<sent.length; i++) {
            assert.true(received[i] === sent[i], "Unmatched elements "+received[i]+" "+sent[i]);
        }
        this.cb();
    }
});
assert.callback("filterObject-withStringify", function(callback){
    f.init(callback);
}, 1500);


