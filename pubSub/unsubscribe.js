require("../../../engine/core").enableTesting();
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
const assert = require("../../../modules/double-check").assert;
var channelName = "superFunChannel";
var received = [];
var sent = ["Message should be received"];


var f = $$.flow.create("unsubscribe",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channelName, this.callback, this.waitForMore);
        this.publish({msg:"Message should be received"});
        this.unsubscribe(channelName, this.callback);
        this.publish({msg:"should not receive this!"});
        this.publish({msg:"should not receive this!"});
        setTimeout(this.test, 1000);
    },
    waitForMore:function(){
        return false;
    },
    publish:function(message){
        soundPubSub.publish(channelName, message);
    },
    unsubscribe:function (channelName, callback){
        soundPubSub.unsubscribe(channelName, callback);
    },
    callback:function(message){
        received.push(message.msg);
    },
    test :function () {
        assert.true(sent.length == 1, "Size should be 1 but it is"+sent.length);
        assert.true(received.length >0, "No message was received " );
        for (var i = 0; i < sent.length; i++) {
            assert.true(received[i] === sent[i], "Unmatched elements");
        }
        this.cb();
    }
});
assert.callback("unsubscribe", function(callback){
    f.init(callback);
}, 1500);
