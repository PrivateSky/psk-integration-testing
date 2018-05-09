require("../../../engine/core").enableTesting();
const  assert = require("../../../modules/double-check").assert;
const  soundPubSub = require('../../../engine/pubSub/core/soundPubSub.js').soundPubSub;
var channelName = "superFunChannel";
var registered = ["edu", "europe"];
var sent = ["Message on edu topic(Europe)!", "Second message "];
var received = [];


var f = $$.flow.create("filterMessagesWithMultipleFilters",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channelName, this.callback, null, this.filter);
        this.publish({msg:"Message on edu topic(Europe)!", filter:["europe", "edu"]});
        this.publish({msg:"should not receive this message!", filter:"euro"});
        this.publish({msg:"Second message ", filter:["edu", "europe"]});
        setTimeout(this.test, 1000);
    },
    publish:function(message) {
        soundPubSub.publish(channelName, message);
    },
    filter:function (message) {
        return checkFilter(message);
        function checkFilter (message) {
            if (message.filter.length == registered.length) {
                var result = false;
                for(var i = 0; i < message.filter.length; i++) {
                    if (registered.includes(message.filter[i])) {
                        result = true;
                    } else {
                        return false;
                    }
                }
            } else {
                result = false;
            }
            return result;
        }
    },
    callback:function(message){
        received.push(message.msg);
    },
    test :function () {
        assert.true(sent.length === 2, "Size should be 2 but it is"+sent.length);
        assert.true(sent.length === received.length, "Something happened with the messages array size");
        for(var i=0; i<sent.length; i++) {
            assert.true(received[i] === sent[i], "Unmatched elements "+received[i]+" "+sent[i]);
        }
        this.cb();
    }
});
assert.callback("filterMessagesWithMultipleFilters", function(callback){
    f.init(callback);
}, 1200);
