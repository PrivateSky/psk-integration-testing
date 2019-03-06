/**
 * Test Integration Runner
 * 
 * This API abstracts the setup, initialization and
 * the internal butchery for PSKY.
 * 
 */

/* Example:

const tir = require('./tir');
const assert = require('double-check').assert;

const domain = 'local';
const agents = [];
const swarm = '../builds/devel/domain.js';

assert.callback('Local connection testing', (finished) => {
  
  tir.launch(domain, agents, swarm, function() {
    
    tir.interact('local', 'exampleAgent').startSwarm("echo", "say", "Hello").onReturn(result => {
      assert.equal("Echo Hello", result);
      finished();
      tir.tearDown(0);
    });

  });

}, 3500);

*/

require("./../../../builds/devel/pskruntime.js");
require('./../../../builds/devel/psknode');

const os = require('os');
const path = require('path');
const fs = require('fs');
const interact = require('interact');

const child_process = require("child_process");
const pskdb = require('pskdb')

const getTempDir = (dir) => path.join(os.tmpdir(), dir);
const createKey = (name) => ('' + name).split(' ').map((word, idx) => idx === 0 ? word.toLocaleLowerCase() : word.substr(0, 1).toLocaleUpperCase() + word.toLowerCase().substr(1)).join('');

const createSetup = (domain, agents, swarmDescribes) => {
  const dKey = createKey(domain);
  return {
    name: domain,
    workspace: getTempDir(dKey + 'Workspace'),
    queue: getTempDir(dKey + 'Queue'),
    result: getTempDir(dKey + 'Result'),
    agents,
    swarmDescribes,
    testerNode: null,
    localDomain: null,
  };
};

const rmDeep = (folder) => {
  if (fs.existsSync(folder)) {
    fs.readdirSync(folder).forEach(function(file, index){
      var curPath = path.join(folder, file);
      if (fs.lstatSync(curPath).isDirectory()) { 
        rmDeep(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folder);
  }
};

const cleanup = (domainConfig) => {
  rmDeep(domainConfig.workspace);
  rmDeep(domainConfig.queue);
  rmDeep(domainConfig.result);
};

const Tir = function () {

  const domainConfigs = {};

  this.launch = (domain, agents, swarmDescribes, callable) => {

    const domainConfig = createSetup(domain, agents, swarmDescribes);

    // cleanup the folders, maybe leftovers from a previously failed test
    cleanup(domainConfig);

    // save the reference
    domainConfigs[domain] = domainConfig;

    //enable blockchain
	  pskdb.startDB(domainConfig.workspace);

    let transaction = $$.blockchain.beginTransaction({});
    let localDomain = transaction.lookup("DomainReference", domainConfig.name);
    // TODO: this is still local?
    localDomain.init("system", "local");

    localDomain.setWorkspace(domainConfig.workspace);
    localDomain.setConstitution(domainConfig.swarmDescribes);
    localDomain.addLocalInterface("local", domainConfig.queue);
    transaction.add(localDomain);
    $$.blockchain.commit(transaction);

    // TODO: do we need this?
    domainConfig.localDomain = localDomain;

    domainConfig.testerNode = child_process.fork("./../../../engine/launcher", [domainConfig.workspace], {stdio:"inherit"});

    setTimeout(() => {
      // what we will be exposing on this callable?
      callable();
    }, 5);
  };

  this.interact = (domain, agent) => {
    const domainConfig = domainConfigs[domain];
    if (domainConfig === undefined) {
      throw new Error('Could not find domain ' + domain + ' in ' + Object.keys(domainConfigs).join(', '));
    } else {
      return interact.createNodeInteractionSpace(agent, domainConfig.queue, domainConfig.result);
    }
  }

  this.tearDown = (exitStatus) => {
    Object.keys(domainConfigs).forEach(name => {
      domainConfigs[name].testerNode.kill();
      cleanup(domainConfigs[name]);
    });

    if (exitStatus !== undefined) {
      process.exit(exitStatus);
    }
  };
}

module.exports = new Tir();