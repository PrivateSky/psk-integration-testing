require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
var channelNames = {ch1:"superFunChannel", ch2:"notSoFunChannel"};
var sub1 = "", sub2 = "";


var f = $$.flow.create("multipleSubscribersMultipleChannels",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channelNames.ch1, this.callback1);
        soundPubSub.subscribe(channelNames.ch2, this.callback2);
        this.publish(channelNames.ch1, {msg1:"superFunChannel"});
        this.publish(channelNames.ch2, {msg2:"notSoFunChannel"});
        setTimeout(this.test, 1000);
    },
    publish:function(channelNames, message){
        soundPubSub.publish(channelNames, message);
    },
    callback1:function(message){
        sub1 = message.msg1;
    },
    callback2:function(message){
        sub2 = message.msg2;
    },
    test:function (){
        assert.true(sub1.length>0 && sub2.length>0);
        assert.true(sub1 === channelNames.ch1 && sub2 === channelNames.ch2);
        this.cb();
    }
});
assert.callback("multipleSubscribersMultipleChannels", function(callback){
    f.init(callback);
}, 1500);
