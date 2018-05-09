require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
var test =[null, undefined, {}, "string", true, function(){this.cb();}];


var f = $$.flow.create("testAcceptedCallbackType",{
    init:function(cb){
        this.cb = cb;
        for(var i = 0; i<test.length; i++) {
            this.subscribe("channel1", test[i]);
            this.publish("channel1", {msg:"hello"});
        }
    },
    subscribe:function(channelName, callBack, waitForMore, filter){
            soundPubSub.subscribe(channelName, callBack, waitForMore, filter)
    },
    publish:function(channelName, message) {
        soundPubSub.publish(channelName, message);
    }
});
assert.callback("testAcceptedCallbackType", function (callback){
    f.init(callback);
}, 1500);
