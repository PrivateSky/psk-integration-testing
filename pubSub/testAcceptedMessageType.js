require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
var test = [null, undefined, "string", false, {}, [], function(){}];
var channels = {ch1:"superFunChannel", ch2:"Random" };


var f = $$.flow.create("testAcceptedMessageType",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channels.ch1, this.callback);
        for(var i = 0 ;i<test.length; i++) {
            this.publish(channels.ch1, test[i]);
        }
    },
    publish:function(channelName, message){
            soundPubSub.publish(channelName, message);
    },
    callback:function(message) {
        if (Object.prototype.toString.call(message) == "[object Function]"){
        this.cb();
        }
    }
});
assert.callback("testAcceptedChannelName", function (callback){
    f.init(callback);
}, 1500);
