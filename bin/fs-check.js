
// Output on the console the valid proxies loaded from a file
// You can change the config used to load the proxies,
// see in the file model.js the FileConfig object
const proxyLoader = require('../lib/proxyfileloader');
const log = require('../lib/logging').Logger;

function FsChecker(file) {
  this.config = proxyLoader.config().setProxyFile(file);
}

FsChecker.prototype.check = function() {
  proxyLoader.loadProxyFile(this.config, (error, proxyList) => {
    if (error) {
      log.error(error);
    } else if (proxyList.getProxies().length === 0) {
      console.log('No valid proxy found');
    } else {
      console.log('***** List of valid proxies ***** ');
      proxyList.getProxies().forEach((proxy) => {
        console.log(proxy.toString());
      });
    }
  });
};

module.exports.FsChecker = FsChecker;
