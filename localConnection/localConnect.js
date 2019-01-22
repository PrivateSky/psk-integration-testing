require("./../../../builds/devel/pskruntime.js");
require('./../../../builds/devel/psknode');

const path = require("path");
const fs = require('fs');
const interact = require("interact");
const assert = require("double-check").assert;

function deleteFolder(folder) {
  if (fs.existsSync(folder)) {
    fs.readdirSync(folder).forEach(function(file, index){
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

const localConfDir = "localConf";
const localInterfaceDir = "../tmp/localqueue/system";
const returnLocalInterfaceDir = "result";


function cleanUp(){
	deleteFolder(localConfDir);
	deleteFolder(returnLocalInterfaceDir);
	deleteFolder(localInterfaceDir);
}

cleanUp();

assert.callback("Local connection testing", (callback)=> {
	
	//enabling blockchain from confDir
	require('pskdb').startDB(localConfDir);

	let transaction = $$.blockchain.beginTransaction({});
	let localdomain = transaction.lookup("DomainReference", "local");
	localdomain.init("system", "local");
	localdomain.setWorkspace(path.resolve(localConfDir));
	localdomain.setConstitution("../builds/devel/domain.js");
	localdomain.addLocalInterface("local", localInterfaceDir);
	transaction.add(localdomain);
	$$.blockchain.commit(transaction);

	const child_process = require("child_process");
	var testerNode = child_process.fork("./../../../engine/launcher", [localConfDir], {stdio:"inherit"});

	setTimeout(()=>{
		const ni = interact.createNodeInteractionSpace("exampleAgent", path.resolve(path.join("..", "..", localInterfaceDir)), path.resolve(returnLocalInterfaceDir));
		
		ni.startSwarm("echo", "say", "Hello").onReturn((result)=>{
			assert.equal("Echo Hello", result);
			callback();
			
			testerNode.kill();
			
			cleanUp();
			process.exit(0);
		})
	}, 2000);
}, 3500);