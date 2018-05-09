require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
var channelName = "superFunChannel";
var sent = ["only one"];
var received = [];

var f = $$.flow.create("waitForOnlyOneMessage",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channelName, this.callback, this.waitForMore);
        this.publish({msg:"only one"});
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
    callback:function(message){
        received.push(message.msg);
    },
    test:function() {
        assert.true(sent.length == 1, "Size should be 1 but it is" + sent.length);
        assert.true(received.length == 1,"More than one message was sent and received");
        for (var i = 0; i < sent.length; i++) {
            assert.true(received[i] === sent[i], "Unmatched elements");
        }
        this.cb();
    }
});
assert.callback("waitForOnlyOneMessage", function(cb){
    f.init(cb);
}, 1500);