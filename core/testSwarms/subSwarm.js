var assert = $$.requireModule("double-check").assert;

$$.swarm.describe("subSwarm",{
    public:{
        value:"int"
    },
    doSomething:function(v1, v2){
        this.value = v1 * v2;
        this.return(null,v1 + v2);
    }
});

var f = $$.swarm.create("mainSwarm", {
    begin:function(callback,a1,a2){
        this.callback=callback;
        $$.swarm.start("testSwarms.subSwarm", "agent", "doSomething", a1,a2).onReturn(this.afterExecution);

    },
    afterExecution: function(err, res, wholeSwarm){
        var newSwarm = $$.swarm.restart("testSwarms.subSwarm", wholeSwarm);
        assert.equal(newSwarm.value,2,"Subswarm's internal value is wrong");
        assert.equal(res,3,"Value returned by subswarm is wrong");
        this.callback();
    }
});