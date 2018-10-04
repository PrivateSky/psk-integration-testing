var assert=require("double-check").assert;

$$.swarm.describe("keepAliveSwarm", {
    protected:{
        count:"int"
    },
    public:{
        xcount:"int",
        callCounter:"int"
    },
    begin:function(callback){
        this.count = 3; //allow only 3 messages
        this.xcount = 0;
        this.callback=callback;
        $$.swarm.create("testSwarms.keptAliveSwarm").swarm("space1\\agent\\agent_007", "doSomething").onReturn(this.afterExecution, this.waitForMore);
    },
    waitForMore:function(){
        this.count--;
        this.xcount--;
        assert.equal(this.xcount,0,"Fail in callback sequence");
        return this.count > 0;
    },
    afterExecution: function(err, res){
        console.log("res =",res);
        assert.equal(err,null,"Error");
        if(res == 4){
            this.callback();
        }
        this.xcount++;

    }
});