/**
 *  This component loads a list of proxies from a txt file
 *
 */

const fs = require('fs');
const log = require('./logging.js').Logger;
const model = require('./model.js');
const checker = require('./proxychecker.js');

// Async load of a proxy file - main method of this module

const loadProxyFile = function(config, endCallback) {
  let proxyList = null;

  async.series([
    function(callback) {
      if (config.isPersist() && config.removeExistingProxies) {
        config.pm.deleteAll();
      }

      readProxyFile(config.proxyFile, (error, result) => {
        proxyList = result;
        callback(error);
      });
    },
    function(callback) {
      if (config.hasToCheckProxies) {
        checker.checkAllProxies(proxyList, config.check, (error) => {
          callback(error);
        });
      } else {
        callback();
      }
    },
    function(callback) {
      if (config.removeInvalidProxies) {
        proxyList.proxies = _.filter(proxyList.proxies, (proxy) => proxy.valid);
      }

      callback();
    }
  ],
  (error, results) => {
    // results is now equal to ['one', 'two']
    log.debug('End of loading proxies');

    if (config.isPersist()) {
      log.debug('Persist the proxies into the DB');
      config.pm.insert(proxyList.getProxies());
    }

    endCallback(error, proxyList);
  });
};

// Read the default proxy file (should be named proxies.txt and be present on the root folder)
const loadDefaultProxies = function(callback) {
  const defaultConfig = config();

  if (fs.existsSync(defaultConfig.proxyFile)) {
    loadProxyFile(defaultConfig, (error, proxies) => {
      callback(error, proxies);
    });
  } else {
    callback(new Error('default file proxies.txt not found'));
  }
};

// Read a proxy txt file & create a ProxyList
var readProxyFile = function(file, callback) {
  log.debug(`read proxy file : ${ file }`);
  fs.readFile(file, (error, data) => {
    if (error) {
      log.error(`Impossible to read the proxy file : ${ file } error : ${ error }`);
      callback(error);

      return;
    }

    const lines = data.toString().split('\n');

    const proxyList = new model.ProxyList();

    for (let i = 0; i < lines.length; i++) {
      // Ignore blank lines & comments
      if (lines[i] === '' || lines[i].charAt(0) === '#') {
        continue;
      }

      const proxyInfo = lines[i].split(':');

      if (proxyInfo.length !== 4 && proxyInfo.length !== 2) {
        log.error(`Incorrect line : ${ lines[i] }in file : ${ file }`);

        // If one line in the proxy file is not well formated => enjoying an error
        callback(new Error(`Incorrect structure in the proxy file : ${ file }`));

        return;
      }

      const proxy = new model.Proxy().fromArray(proxyInfo);

      proxyList.push(proxy);
    }

    callback(null, proxyList);
  });
};

module.exports.loadDefaultProxies = loadDefaultProxies;

module.exports.loadProxyFile = loadProxyFile;

module.exports.config = config;
