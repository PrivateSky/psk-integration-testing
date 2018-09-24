var fs = require("fs");
require("../../../engine/core").enableTesting();

var beesHealer = require("callflow").beesHealer;
var assert = require("double-check").assert;

var f = $$.swarms.create("simpleSwarm", {
    private:{
        a1:"int",
        a2:"int"
    },
    public:{
        result:"int"
    },
    begin:function(a1,a2){
        this.a1 = a1;
        this.a2 = a2;
        this.result=this.a1+this.a2;
    }
});

$$.ensureFolderExists("tmpSwarm", function(){
	fs.writeFileSync("./tmpSwarm/swarm",JSON.stringify(beesHealer.asJSON(f.getInnerValue(),"begin",[1,2],function(err,res){
			console.log("writing done!");
			if(err){
				console.error(err);
				return;
			}
		}))
	);
	var data=fs.readFileSync("./tmpSwarm/swarm");
	var swarm=$$.swarmsInstancesManager.revive_swarm(JSON.parse(data));
	assert.equal(swarm.result,3,"Revitalisation failed");
	fs.unlinkSync("./tmpSwarm/swarm");
});
