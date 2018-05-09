require("../../../engine/core").enableTesting();
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
const assert = require("../../../modules/double-check").assert;
var channelName = "superFunChannel";
var sent = ["Only this should be sent! in case of LastMessageCompacter"];
var received = [];


var f = $$.flow.create("basicPubSubTestWithCompacter",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channelName, this.callback);
        soundPubSub.registerCompactor("base", this.showOnlyLastMessage);
        this.publish({msg:"Only this should be sent! in case of FirstMessageCompacter", type: "base"});
        this.publish({msg:"Should be compacted", type: "base"});
        this.publish({msg:"Only this should be sent! in case of LastMessageCompacter", type: "base"});
        setTimeout(this.test, 1000);
    },
    showOnlyLastMessage:function(newMessage, previousMessage){
        previousMessage.__transmisionIndex=undefined;
        previousMessage.msg = newMessage.msg;
        return previousMessage;
    },
    publish:function(message){
        soundPubSub.publish(channelName, message);
    },
    callback:function(message){
        received.push(message.msg)
    },
    test:function () {
        assert.true(sent.length == 1, "Size should be 1 but it is"+sent.length);
        assert.true(sent.length === received.length, "Something happened with the messages array size");
        for(var i = 0; i<sent.length; i++) {
            assert.true(received[i] === sent[i], "Unmatched elements "+received[i]+" "+sent[i]);
        }
        this.cb();
    }
});
assert.callback("basicPubSubTestWithCompacter", function(callback){
    f.init(callback);
},1500);