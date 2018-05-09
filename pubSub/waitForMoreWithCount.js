require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
var channelName = "superFunChannel";
var received  = [];
var sent = [1, 2, 3];


var f = $$.flow.create("orderOfMessagesWithLimit",{
    public:{
        count: "int"
    },
    init:function(cb) {
        this.cb = cb;
        this.count = 3;
        soundPubSub.subscribe(channelName, this.callback, this.waitForMore);
        this.publish({msg: 1});
        this.publish({msg: 2});
        this.publish({msg: 3});
        this.publish({msg: 4});
        this.publish({msg: 4});
        setTimeout(this.test, 1000);
    },
    waitForMore:function(){
        return this.count != 0;
    },
    publish:function(message){
        soundPubSub.publish(channelName, message);
    },
    callback:function(message){
        this.count --;
        received.push(message.msg);
    },
    test :function () {
        assert.true(sent.length == 3, "Size should be 3 but it is"+sent.length);
        assert.true(sent.length === received.length, "Something happened with the messages array size");
        assert.true(this.count == 0, "Count should be zero but it is "+this.count);
        for (var i = 0; i < sent.length; i++) {
            assert.true(sent[i] == received[i], "Unmatched elements "+sent[i]+" "+received[i]);
        }
        this.cb();
    }
});
assert.callback("orderOfMessagesWithLimit", function(cb){
    f.init(cb);
}, 1500);