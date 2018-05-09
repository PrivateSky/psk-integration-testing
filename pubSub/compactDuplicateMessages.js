require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
var channelName = "superFunChannel";
var sent = ["Your account has been disabled", "Account has been enabled"];
var received = [];
var count = 0;


var f = $$.flow.create("CompactFilteredDuplicates",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channelName, this.callback, null, this.filter);
        soundPubSub.registerCompactor("base", this.removeDuplicateMessages);
        this.publish({msg:"Your account has been disabled", type: "base", filter:"financial"});
        this.publish({msg:"Your account has been disabled", type: "base", filter:"financial"});
        this.publish({msg:"Your account has been disabled", type: "base", filter:"financial"});
        this.publish({msg:"Your account has been disabled", type: "base", filter:"financial"});
        this.publish({msg:"Account has been enabled", type: "base", filter:"financial"});
        this.publish({msg:"Account has been enabled", type: "base", filter:"tech"});
        this.publish({msg:"Account has been enabled", type: "base", filter:"tech"});
        setTimeout(this.test, 1000);
    },
    removeDuplicateMessages:function(newMessage, previousMessage){
        if (newMessage.filter == previousMessage.filter) {
            if(previousMessage.msg === newMessage.msg) {
                count++;
                previousMessage.msg = newMessage.msg;
                return previousMessage;
            }else{
                return newMessage;
            }
        }
    },
    filter:function(message){
        return message.filter == "financial";
    },
    publish:function(message){
        soundPubSub.publish(channelName, message);
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
assert.callback("CompactFilteredDuplicates", function(callback){
    f.init(callback);
}, 1500);

