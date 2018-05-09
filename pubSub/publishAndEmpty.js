require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
var channelName = "superFunChannel";


var f = $$.flow.create("publishAndEmpty",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channelName, this.callback);
        var catchedSubscriberList = this.publish({msg:"World!"});
        catchedSubscriberList.splice(0, catchedSubscriberList.length);
        this.publish({msg:"World!"});
    },
    publish:function(message){
        return soundPubSub.publish(channelName, message);
    },
    callback:function(message){
        assert.true(message.msg === "World!");
        this.cb();
    }
});
assert.callback("publishToRegisteredSubscriber", function(callback){
    f.init(callback);
}, 1500);