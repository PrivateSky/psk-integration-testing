require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
var channelName = "superFunChannel";
var registered = {region:"europe", topic:"edu"}
var sent = ["It works!", "Message on edu topic(Europe)!"];
var received = [];


var f = $$.flow.create("filter",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channelName, this.callback, null, this.filter);
        this.publish({msg:"It works!", filter:registered});
        this.publish({msg:"Message on edu topic(Europe)!", filter:registered});
        this.publish({msg:"Message on edu topic(Europe)!", filter:{topic:"edu", region:"africa", size:23}});
        setTimeout(this.test,1000);
    },
    publish:function(message) {
        soundPubSub.publish(channelName, message);
    },
    filter:function (message) {
        return message.filter == registered;

    },
    callback:function(message){
        received.push(message.msg);
    },
    test :function () {
        assert.true(sent.length == 2, "Size should be 2 but it is"+sent.length);
        assert.true(sent.length === received.length, "Something happened with the messages array size");
        for(var i = 0; i<sent.length; i++) {
            assert.true(received[i] === sent[i], "Unmatched elements "+received[i]+" "+sent[i]);
        }
        this.cb();
    }
});
assert.callback("filter", function(callback){
    f.init(callback);
}, 1500);
