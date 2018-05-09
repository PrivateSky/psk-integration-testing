require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
var channelName = "superFunChannel";
var sent = "World!";
var received;


var f = $$.flow.create("publishToRegisteredSubscriber",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channelName, this.callback);
        this.publish({msg: "World!"});
        setTimeout(this.test, 1000);
    },
    publish:function(message) {
        soundPubSub.publish(channelName, message);
    },
    callback:function(message) {
      received = message.msg;
    },
    test:function () {
        assert.notNull(received, "Message has not been received");
        assert.true(received === sent);
        this.cb();
    }
});
assert.callback("publishToRegisteredSubscriber", function(callback){
    f.init(callback);
}, 1500);

