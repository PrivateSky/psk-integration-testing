require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
var channelName = "superFunChannel";
var sent = "Message should be received";

var f = $$.flow.create("unsubscribeTwice",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channelName, this.callback);
        this.publish({msg:"Message should be received"});
        this.unsubscribe(channelName, this.callback);
        this.unsubscribe(channelName, this.callback);
        this.publish({msg:"should not receive this!"});
    },
    publish:function(message){
        soundPubSub.publish(channelName, message);
    },
    unsubscribe:function (channelName, callback){
        soundPubSub.unsubscribe(channelName, callback);
    },
    callback:function(message){
        assert.true(message.msg === sent);
            this.cb();
    }
});
assert.callback("waitingToReceiveMultipleMessages", function(callback){
    f.init(callback);
}, 1500);