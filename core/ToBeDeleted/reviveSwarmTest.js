const fs = require("fs");
require("../../../../psknode/bundles/pskruntime");

const beesHealer = require("swarmutils").beesHealer;
const assert = require("double-check").assert;

const f = $$.swarms.describe("simpleSwarm", {
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

fs.mkdir("tmpSwarm", {recursive: true},  () => {
    beesHealer.asJSON(f().getInnerValue(), "begin", [1, 2], function (err, res) {
        console.log("writing done!");
        if (err) {
            console.error(err);
            return;
        }

        fs.writeFileSync("./tmpSwarm/swarm", JSON.stringify(res));
        const data = fs.readFileSync("./tmpSwarm/swarm");
        const swarm = $$.swarmsInstancesManager.revive_swarm(JSON.parse(data.toString()));

        assert.equal(swarm.result, 3, "Revitalisation failed");
        fs.unlinkSync("./tmpSwarm/swarm");
        console.log('test finished');
    });
});
