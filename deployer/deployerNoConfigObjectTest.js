require("../../../engine/core").enableTesting();

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

const assert = require("../../../modules/double-check").assert;

var f = $$.flow.create("deployerNoConfigObject", {
    start:function() {
        this.act();
    },
    act: function() {

        $$.callflow.start("deployer.Deployer").run(null, this.check);
    },
    check: function(error) {
        assert.pass("deployerNoConfigObject", function() {
            assert.notNull(error, "Should not be errors!");
        })
    }
});
f.start();

