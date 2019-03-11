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
  const rootFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'psk_'));

  let testerNode = null;


  /**
   * Adds a domain to the configuration, in a fluent way.
   * Does not launch anything, just stores the configuration.
   */
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


  /**
   * Launches all the configured domains.
   */
  this.launch = (callable) => {
    pskdb.startDB(rootFolder);

    Object.keys(domainConfigs).forEach(name => {
      const domainConfig = domainConfigs[name];
      this.buildDomainConfiguration(domainConfig);
    });

    testerNode = child_process.fork("./../../../engine/launcher", [rootFolder], {stdio:"inherit"});

    setTimeout(() => {
      callable();
    }, 10);
  };


  /**
   * Builds the config for a node.
   */
  this.buildDomainConfiguration = (domainConfig) => {

    let transaction = $$.blockchain.beginTransaction({});
    let domain = transaction.lookup('DomainReference', domainConfig.name);
    domain.init('system', domain);

    fs.mkdirSync(domainConfig.workspace);
    domain.setWorkspace(domainConfig.workspace);
    domain.setConstitution(domainConfig.swarmDescribes);
    domain.addLocalInterface('local', domainConfig.inputQueue);
    transaction.add(domain);
    $$.blockchain.commit(transaction);

    if (domainConfig.agents && Array.isArray(domainConfig.agents) && domainConfig.agents.length > 0) {
      let domainBlockChain = pskdb.createDBHandler(domainConfig.conf);

      domainConfig.agents.forEach(agentName => {
        let trans = domainBlockChain.beginTransaction({});
        let agent = trans.lookup("Agent", agentName);
        trans.add(agent);
        domainBlockChain.commit(trans);
      });
    }
  };

  /**
   * Interacts with an agent of a domain
   */
  this.interact = (domain, agent) => {
    const domainConfig = domainConfigs[domain];
    if (domainConfig === undefined) {
      throw new Error('Could not find domain ' + domain + ' in ' + Object.keys(domainConfigs).join(', '));
    } else {
      return interact.createNodeInteractionSpace(agent, domainConfig.workspace, domainConfig.result);
    }
  };

  /**
   * Tears down all the nodes
   */
  this.tearDown = (exitStatus) => {
    console.info('[TIR] Tearing down...');
    if (testerNode) {
      console.info('[TIR] Killing launcher',testerNode.pid);
      testerNode.kill();
    }
    setTimeout(() => {
      console.info('[TIR] Removing temporary folder', rootFolder);
      rmDeep(rootFolder);
      console.info('[TIR] Temporary folder removed', rootFolder);
      if (exitStatus !== undefined) {
        process.exit(exitStatus);
      }
    }, 3000);
  };
}

module.exports = new Tir();
