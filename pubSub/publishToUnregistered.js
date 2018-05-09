require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
const soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
var channels = {ch1:"superFunChannel", ch2:"News1", ch3:"Travel", ch4:"Closed"};
var sent = ["Draught in Greece!", "Draught ended in Greece!", "Visit beautiful Greece! "];
var received = [];


var f = $$.flow.create("publishToUnregistered",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channels.ch2, this.callback, null, this.filter);
        soundPubSub.subscribe(channels.ch3, this.callback, null, this.filter1);
        this.publish(channels.ch2, {msg:"Draught in Greece!", filter:"News"});
        this.publish(channels.ch2, {msg:"Draught in Greece!", filter:"hhh"});
        this.publish(channels.ch3, {msg:"Visit beautiful Greece! ", filter:"Europe"});
        this.publish(channels.ch2, {msg:"Draught ended in Greece!", filter:"News"});
        this.publish(channels.ch4, {msg:"I should not be received", filter:"News"});
        setTimeout(this.test, 1000);
    },
    publish:function(channels, message){
        soundPubSub.publish(channels, message);
    },
    filter:function (message){
        return message.filter === "News";
    },
    filter1:function (message) {
        return message.filter === "Europe";
    },
    callback:function(message) {
        received.push(message.msg);
    },
    test:function () {
        assert.true(sent.length == 3, "Size should be 3 but it is"+sent.length);
        assert.true(sent.length === received.length, "Something happened with the messages array size");
        for(var i = 0; i<sent.length; i++) {
            assert.true(received[i] === sent[i], "Unmatched elements "+received[i]+" "+sent[i]);
        }
        this.cb();
    }
});
assert.callback("publishToUnregistered", function(callback){
    f.init(callback);
}, 1500);

