require("../../../../builds/devel/pskruntime");
require("../../../../builds/devel/psknode");
var assert = require('double-check').assert;

var shModule = require("../../../../modules/pskcrypto/lib/utils/signatureHandler");

//??? Is `signatureHandler.js` abandoned?
var sh = shModule.getAgentSignatureHandler("testAgent");

var test = $$.flow.describe("signatureTest", {
    public: {
        result: "int"
    },
    start: function (callback) {
        this.result = 0;
        this.callback = callback;
        this.obj = {
            name: "Hello World"
        }
        this.digest = sh.digest(this.obj);
        //console.log(this.digest);
        sh.sign(this.digest, this.getSignature);
    },
    getSignature: function (err, signature) {
        this.signature = signature;
        //console.log("Signature:", this.signature);
        this.result++;
        assert.notEqual(signature, null, "Signature is null");

        sh.verify(this.digest, signature, this.printResults);
    },

    printResults: function (err, isGood) {
        this.result--;
        assert.equal(err, null, "Error");
        assert.equal(this.result, 0, 'Callback sequence does not match');
        assert.equal(isGood, true, "Fail to verify signature");
        this.callback();
    }
})
assert.callback("Signsensus test", function (callback) {
    test().start(callback);
});


