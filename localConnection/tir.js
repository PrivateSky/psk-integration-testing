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
const pskdb = require('pskdb');

const createKey = function (name) {
  let parsed = ('' + name);
  parsed.replace(/^[A-Za-z0-9 ]+/g, ' ');
  return parsed
    .split(' ')
    .map((word, idx) => idx === 0 ? word.toLocaleLowerCase() : word.substr(0, 1).toLocaleUpperCase() + word.toLowerCase().substr(1))
    .join('');
};

const rmDeep = (folder) => {
  if (fs.existsSync(folder)) {
    fs.readdirSync(folder).forEach((file) => {
      const curPath = path.join(folder, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        rmDeep(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folder);
  }
};

const Tir = function () {

  const domainConfigs = {};
  const rootFolder = fs.mkdtempSync(path.join(os.tmpdir(), ''));

  this.addDomain = (domain, agents, swarmDescribes) => {
    let workspace = path.join(rootFolder, createKey(domain));
    let domainConfig = {
      name: domain,
      agents,
      swarmDescribes,
      workspace: workspace,
      inputQueue: path.join(workspace, 'inputQueue'),
      conf: path.join(workspace, 'conf'),
      result: path.join(workspace, 'result'),
      testerNode: null,
    };
    domainConfigs[domain] = domainConfig;
    return this;
  };

  this.launch = (callable) => {
    rmDeep(rootFolder);
    fs.mkdtempSync(rootFolder);
    pskdb.startDB(rootFolder);

    Object.keys(domainConfigs).forEach(name => {
      const domainConfig = domainConfigs[name];
      this.startDomain(domainConfig);
    });

    setTimeout(() => {
      callable();
    }, 50);
  };

  // this.setup = function(domain, agents, swarmDescribes) {
  //   if (!rootFolder) {
  //     rootFolder = fs.mkdtemp(path.join(os.tmpdir(), ''));
  //     pskdb.startDB(rootFolder);
  //   }
  //
  //   let transaction = $$.blockchain.beginTransaction({});
  //   let localDomain = transaction.lookup("DomainReference", domain);
  //
  //   localDomain.init("system", domain);
  //   localDomain.setWorkspace(path.join(rootFolder, domain));
  //
  //   //we need to bundle swarmDescribes and after that store the path
  //   localDomain.setConstitution(swarmDescribes);
  //   localDomain.addLocalInterface("local", path.join(localDomain.getWorkspace(), "inputQueue"));
  //
  //   transaction.add(localDomain);
  //   $$.blockchain.commit(transaction);
  //
  //   if (agents) {
  //     let domainBlockChain = pskdb.startDb(path.join(localDomain.getWorkspace(), "conf"));
  //
  //     for (let i = 0; i < agents.length; i++) {
  //       let agentName = agents[i];
  //
  //       let trans = domainBlockChain.beginTransaction({});
  //       let agent = trans.lookup("Agent", agentName);
  //
  //       trans.add(agent);
  //       domainBlockChain.commit(trans);
  //     }
  //   }
  // };

  this.startDomain = (domainConfig) => {
    if (domainConfig.testerNode) {
      return false;
    }

    let transaction = $$.blockchain.beginTransaction({});
    let domain = transaction.lookup('DomainReference', domainConfig.name);
    domain.init('system', domain);
    domain.setWorkspace(domainConfig.workspace);
    domain.setConstitution(domainConfig.swarmDescribes);
    domain.addLocalInterface('local', domainConfig.inputQueue);
    transaction.add(domain);
    $$.blockchain.commit(transaction);

    if (domainConfig.agents && Array.isArray(domainConfig.agents) && domainConfig.agents.length > 0) {
      // Question: is this initialized regardless of agents presence?
      let domainBlockChain = pskdb.startDb(domainConfig.conf);

      domainConfig.agents.forEach(agentName => {
        let trans = domainBlockChain.beginTransaction({});
        let agent = trans.lookup("Agent", agentName);
        trans.add(agent);
        domainBlockChain.commit(trans);
      });

    }

    domainConfig.testerNode = child_process.fork("./../../../engine/launcher", [rootFolder], {stdio:"inherit"});
    return true;
  };

  // this.launch = (domain, agents, swarmDescribes, callable) => {

  //   const domainConfig = createSetup(domain, agents, swarmDescribes);

  //   // cleanup the folders, maybe leftovers from a previously failed test
  //   cleanup(domainConfig);

  //   // save the reference
  //   domainConfigs[domain] = domainConfig;

  //   //enable blockchain
	//   pskdb.startDB(domainConfig.workspace);

  //   let transaction = $$.blockchain.beginTransaction({});
  //   let localDomain = transaction.lookup("DomainReference", domainConfig.name);
  //   // TODO: this is still local?
  //   localDomain.init("system", "local");

  //   localDomain.setWorkspace(domainConfig.workspace);
  //   localDomain.setConstitution(domainConfig.swarmDescribes);
  //   localDomain.addLocalInterface("local", domainConfig.queue);
  //   transaction.add(localDomain);
  //   $$.blockchain.commit(transaction);

  //   // TODO: do we need this?
  //   domainConfig.localDomain = localDomain;

  //   domainConfig.testerNode = child_process.fork("./../../../engine/launcher", [domainConfig.workspace]/*rootFolder*/, {stdio:"inherit"});

  //   setTimeout(() => {
  //     // what we will be exposing on this callable?
  //     callable();
  //   }, 5);
  // };

  this.interact = (domain, agent) => {
    const domainConfig = domainConfigs[domain];
    if (domainConfig === undefined) {
      throw new Error('Could not find domain ' + domain + ' in ' + Object.keys(domainConfigs).join(', '));
    } else {
      return interact.createNodeInteractionSpace(agent, domainConfig.workspace, domainConfig.result);
    }
  };

  this.tearDown = (exitStatus) => {
    Object.keys(domainConfigs).forEach(name => {
      if (domainConfigs[name].testerNode) {
        domainConfigs[name].testerNode.kill();
      }
    });

    rmDeep(rootFolder);

    if (exitStatus !== undefined) {
      process.exit(exitStatus);
    }
  };
}

module.exports = new Tir();
