require("../../../engine/core").enableTesting();
var assert=$$.requireModule("double-check").assert;

var f = $$.swarm.create("simpleSwarm", {
    protected:{
        prot_count:"int"
    },
    public:{
        pub_count:"int"
    },
    begin:function(){
        this.prot_count = 3;
        this.swarm("agent", "doStep", 3);

    },
    doStep:function (value) {
        try {
            this.prot_count += value;
        }catch(err){
            console.log(err);
            assert.notEqual(err,null,"Error expected");
        };
    }
});
f.begin();

