var assert = require("double-check").assert;

$$.swarm.describe("testSandBoxExecution", {
    public:{
        result:"int"
    },
    protected:{
		cb:"function"
    },
    init:function(cb){
        this.result = 0;
        this.cb = cb;
        this.swarm("space1\\agent\\agent_x", "test1").onReturn(this.lastReturn);
        this.cb = cb;
    },
    lastReturn:function(){
		if(this.cb){
			this.cb();
		}
    },
    intermediaryReturn:function(){
        this.return();
    },
    test1:function(){
        assert.equal(this.result,0,"Unexpected result");
        this.result += 1;
        this.swarm("space2\\agent\\agent_007", "test2").onReturn(this.intermediaryReturn);
    },
    test2:function(){
        assert.equal(this.result,1,"Unexpected result");
        this.result += 2;
        this.swarm("crl\\agent\\jhon_smith", "onResult").onReturn(this.intermediaryReturn);
    },
    onResult:function(err, text){
        assert.equal(err,undefined,"Error");
        assert.equal(this.result,3,"Unexpected result");
        this.return();
    }
});