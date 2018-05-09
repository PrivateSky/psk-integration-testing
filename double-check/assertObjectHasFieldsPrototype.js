require("../../../engine/core").enableTesting();
const assert = require("../../../modules/double-check").assert;
var f = $$.flow.create("assertObjectHasFieldsPrototype", {
    action: function (cb) {
        this.cb = cb;
        this.f = function () {
            this.name = "Adam";
            this.age = 23;
        };
        this.f.prototype.citty = "Kansas";
        this.x = new this.f();

        this.y = {
            age: 23,
            name: "Adam",
            citty: "Kansas"
        };
        assert.objectHasFields(this.x, this.y);
    }
});
assert.callback("assertObjectHasFieldsPrototype", function(cb){
    f.action(cb);
}, 1500);