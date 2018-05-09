require("../../../engine/core").enableTesting();
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
const assert = require("../../../modules/double-check").assert;
var test = [null, undefined, "string", true, {}, function(){}, []];


var f = $$.flow.create("testAcceptedChannelName",{
    init:function(cb){
        this.cb = cb;
        for(var i = 0; i<test.length; i++) {
            soundPubSub.subscribe(test[i], this.callback);
            this.publish(test[i], {msg:test[i]});
        }
    },
    subscribe:function(channelName, callBack, waitForMore, filter){
        soundPubSub.subscribe(channelName, callBack, waitForMore, filter);
    },
    publish:function(channelName, message){
        soundPubSub.publish(channelName, message);
    },
    callback:function(message){
        if(Object.prototype.toString.call(message.msg) == "[object Array]" );
        this.cb();
    }
});
assert.callback("testAcceptedChannelName", function (callback){
    f.init(callback);
}, 1000);

