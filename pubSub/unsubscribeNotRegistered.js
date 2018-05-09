require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
var channelName = "BBC3";


var f = $$.flow.create("pubSubUnsubscribeFromUnregisteredChannel",{
    init:function(cb){
        this.cb = cb;
        this.unsubscribe(channelName, this.callback);
    },
    unsubscribe:function (channelName, callback){
        soundPubSub.unsubscribe(channelName, callback);
    },
    callback:function(){
        this.cb();
    }
});
assert.callback("pubSubUnsubscribeFromUnregisteredChannel", function(callback){
    f.init(callback);
}, 1500);

