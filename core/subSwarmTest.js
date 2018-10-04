require("../../../builds/devel/pskruntime");
require("callflow");
require("launcher");
var assert = require("double-check").assert;

$$.swarm.describe("subSwarm",{
    public:{
        value:"int"
    },
    doSomething:function(v1, v2){
        this.value = v1 * v2;
        this.return(null,v1 + v2);
    }
});

var f = $$.swarm.describe("simpleSwarm", {
    begin:function(callback,a1,a2){
        this.callback=callback;
        $$.swarm.start("subSwarm", "agent", "doSomething", a1,a2).onReturn(this.afterExecution);

    },
    afterExecution: function(err, res, wholeSwarm){
        var newSwarm = $$.swarm.restart("subSwarm", wholeSwarm);
        assert.equal(newSwarm.value,2,"Subswarm's internal value is wrong");
        assert.equal(res,3,"Value returned by subswarm is wrong");
        this.callback();
    }
});


assert.callback("Subswarm test",function (callback) {
    $$.swarm.start("simpleSwarm","system","begin",callback,1,2);
})