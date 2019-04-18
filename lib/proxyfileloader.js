/**
 *  This component loads a list of proxies from a txt file
 *
 */
const fs = require('fs');
const util = require('util');
const log = require('./logging.js').Logger;
const { ProxyList, Proxy, FileConfig } = require('./model.js');
const checker = require('./proxychecker.js');

const readFile = util.promisify(fs.readFile);

function config() {
  return new FileConfig();
}
async function loadProxyFile(config) {
  const proxyList = await readProxyFile(config.proxyFile);

  if (config.hasToCheckProxies) {
    await checker.checkAllProxies(proxyList, config.check);
  }

  if (config.removeInvalidProxies) {
    proxyList.proxies = proxyList.proxies.filter((p) => p.valid);
  }

  return proxyList;
}

// Read the default proxy file (should be named proxies.txt and be present on the root folder)
async function loadDefaultProxies() {
  const defaultConfig = new FileConfig();

  return await loadProxyFile(defaultConfig);
}

// Read a proxy txt file & create a ProxyList
async function readProxyFile(file) {
  log.debug(`read proxy file : ${ file }`);
  const lines = (await readFile(file)).toString().split('\n');
  const proxyList = new ProxyList();

  proxyList.setProxies(lines.filter(filterProxies).map((line) => new Proxy().fromArray(line.split(':'))));

  return proxyList;
}

function filterProxies(line) {
  if (line === '' || line.charAt(0) === '#') {
    return false;
  }

  const proxyInfo = line.split(':');

  if (proxyInfo.length !== 4 && proxyInfo.length !== 2) {
    log.error(`Incorrect line : ${ line }`);

    return false;
  }

  return true;
}

exports.config = config;

exports.loadDefaultProxies = loadDefaultProxies;

exports.loadProxyFile = loadProxyFile;
