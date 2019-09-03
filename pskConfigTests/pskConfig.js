require("../../../psknode/bundles/pskruntime.js");
const tir = require('../test-util/tir');

const path = require("path");
const fs = require('fs');
const os = require('os');
const interact = require("interact");
const assert = require("double-check").assert;
const pskdb = require('pskdb');

const args = process.argv.slice(2);

let rootFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'psk_'));
let localConfDir = path.join(rootFolder, "conf");
let localInterfaceInboundDir = path.join(path.resolve(rootFolder), "inbound");
let returnLocalInterfaceDir = path.join(path.resolve(rootFolder), "result");


function deleteFolder(folder) {
    if (fs.existsSync(folder)) {
        fs.readdirSync(folder).forEach(function (file, index) {
            var curPath = path.join(folder, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolder(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folder);
    }
};

function cleanUp() {
    deleteFolder(rootFolder);
}

const swarm = {
    microfon: {
        say: function (input) {
            this.return('Echo message is ' + input);
        }
    }
};


pskdb.startDB(localConfDir);

let transaction = $$.blockchain.beginTransaction({});

//___________ begin adding new domains

let domainCofigStatus = "";
let localdomain = "";
try {
    if(args[0]){
        switch (args[0]) {
            case '1':
                //empty workspace dir
                localdomain = transaction.lookup("DomainReference", "localDomain");
                localdomain.init("system", "localDomain");
                localdomain.setWorkspace("");
                localdomain.addLocalInterface("localDomain", localInterfaceInboundDir);
                localdomain.setConstitution(tir.createConstitution(path.resolve(rootFolder), swarm));
                transaction.add(localdomain);
                $$.blockchain.commit(transaction);
                break;
            case '2':
                //empty workspace dir and localdomain
                localdomain = transaction.lookup("DomainReference", "localDomain");
                localdomain.init("system", "localDomain");
                localdomain.setWorkspace("");
                localdomain.addLocalInterface("localDomain", "");
                localdomain.setConstitution(tir.createConstitution(path.resolve(rootFolder), swarm));
                transaction.add(localdomain);
                $$.blockchain.commit(transaction);
                break;
            case '3':
                //empty localdomain and no constitution
                localdomain = transaction.lookup("DomainReference", "localDomain");
                localdomain.init("system", "localDomain");
                localdomain.setWorkspace(path.resolve(localConfDir));
                localdomain.addLocalInterface("localDomain", "");
                transaction.add(localdomain);
                $$.blockchain.commit(transaction);
                break;
            case '4':
                // no constitution
                localdomain = transaction.lookup("DomainReference", "localDomain");
                localdomain.init("system", "localDomain");
                localdomain.setWorkspace(path.resolve(localConfDir));
                localdomain.addLocalInterface("localDomain", localInterfaceInboundDir);
                transaction.add(localdomain);
                $$.blockchain.commit(transaction);
                break;
            case '5':
                //no swarm
                localdomain = transaction.lookup("DomainReference", "localDomain");
                localdomain.init("system", "localDomain");
                localdomain.setWorkspace(path.resolve(localConfDir));
                localdomain.addLocalInterface("localDomain", localInterfaceInboundDir);
                localdomain.setConstitution(tir.createConstitution(path.resolve(rootFolder), ""));
                transaction.add(localdomain);
                $$.blockchain.commit(transaction);
                break;
        }
    }else{
        localdomain = transaction.lookup("DomainReference", "localDomain");
        localdomain.init("system", "localDomain");
        localdomain.setWorkspace(path.resolve(localConfDir));
        localdomain.addLocalInterface("localDomain", localInterfaceInboundDir);
        localdomain.setConstitution(tir.createConstitution(path.resolve(rootFolder), swarm));
        transaction.add(localdomain);
        $$.blockchain.commit(transaction);
    }

} catch (e) {
    domainCofigStatus = e;
}


//____________end adding new domains______________


const child_process = require("child_process");
const testerNode = child_process.fork("../../../psknode/core/launcher", [localConfDir], {stdio: "inherit"});

setTimeout(() => {
    let swarmStatus = false;
    const ni = interact.createNodeInteractionSpace('Local test agent', path.resolve(localInterfaceInboundDir), path.resolve(returnLocalInterfaceDir));

    assert.callback("PSK config test", finish => {

        ni.startSwarm("microfon", "say", "Hello").onReturn((result) => {
            console.log('----- Swarm result =', result );
            assert.equal("Echo message is Hello", result);
            finish();

        });
        if (!fs.existsSync(path.resolve(rootFolder))) {
            domainCofigStatus = domainCofigStatus + "Missing rootFolder  ";
        }
        if (!fs.existsSync(path.resolve(localConfDir))) {
            domainCofigStatus = domainCofigStatus + "Missing confDir ";
        }
        if (!fs.existsSync(path.resolve(localInterfaceInboundDir))) {
            domainCofigStatus = domainCofigStatus + "Missing inbound  ";
        }

        if (!fs.existsSync(path.resolve(path.join(rootFolder, 'constitution.js')))) {
            domainCofigStatus = domainCofigStatus + "Missing constitution ";
        }
        if (!fs.existsSync(path.resolve(returnLocalInterfaceDir))) {
            domainCofigStatus = domainCofigStatus + "Missing returnLocalInterfaceDir ";
        }

        if(domainCofigStatus == ""){
            domainCofigStatus = "Domain configured ok";
        }

        setTimeout(() => {
            testerNode.kill();
            cleanUp();
            process.exit(0);
        }, 3000);

        assert.equal(domainCofigStatus, "Domain configured ok", domainCofigStatus);


    });
}, 2000);

