require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
var sent = ["First message on edu topic!", "Technology is great! "];
var channelName = "superFunChannel";
var received = [];


var f = $$.flow.create("filterMessagesFromChannel",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channelName, this.callback, this.waitForMore, this.filter);
        soundPubSub.subscribe(channelName, this.callback, this.waitForMore, this.filter1);
        this.publish({msg:"First message on edu topic!", filter:"edu"});
        this.publish({msg:"should not receive this message!", filter:"info"});
        this.publish({msg:"Technology is great! ", filter:"tech"});
        this.publish({msg:"Second message on edu topic!", filter:"edu"});
        setTimeout(this.test, 1000);
    },
    waitForMore:function(){
        return false;
    },
    publish:function(message){
        soundPubSub.publish(channelName, message);
    },
    filter:function (message){
        return message.filter == "edu";
    },
    filter1:function (message){
        return message.filter == "tech";
    },
    callback:function(message){
        received.push(message.msg);
    },
    test :function () {
        assert.true(sent.length == 2, "Size should be 2 but it is"+sent.length);
        assert.true(sent.length === received.length, "Something happened with the messages array size");
        for(var i = 0; i<sent.length; i++) {
            assert.true(received[i] === sent[i], "Unmatched elements "+received[i]+" "+sent[i]);
        }
        this.cb();
    }
});
assert.callback("filterMessagesFromChannel", function(callback){
    f.init(callback);
}, 1500);
