require("../../../engine/core").enableTesting();
const assert  = require("../../../modules/double-check").assert;
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
var channels = { ch1:"superFunChannel", ch2:"Random" };
var received = [];

var f = $$.flow.create("PublishWithNoSubscribers",{
    init:function(cb){
        this.cb = cb;
        this.publish(channels.ch1, {msg:"World!"});
        this.publish(channels.ch2, {msg:"should not receive this!"});
        setTimeout(this.test, 1000);
    },
    waitForMore:function(){
        return false;
    },
    publish:function(channelName, message){
        soundPubSub.publish(channelName, message);
    },
    callback:function(message){
        console.log(message)
       received.push(message.msg);
    },
    test:function(){
        assert.true(received.length == 0, "Size should be 0 but it is"+received.length);
        this.cb();
    }
});
assert.callback("PublishWithNoSubscribers", function(callback){
    f.init(callback);
}, 1500);
