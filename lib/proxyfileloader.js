/**
 *  This component loads a list of proxies from a txt file
 *  The result is stored into JS objects : ProxyList & Proxy (see model.js)
 *
 *  This proxy loader can also (not mandatory):
 *   - Check the proxies with the help of the proxychecker.js component
 *   - Store the proxies into a database in order to use them in other components/services,
 *     with the help of a persistence manager like the mongoDBStore.js
 *
 *  See the FileConfig object  for get more info on the different options
 *
 * The main methods are :
 *  loadDProxyFile
 *  loadDefaultProxies
 *  config
 *
 *
 */

var fs = require('fs');

var async = require("async");
var _ = require("underscore");

var log = require('./logging').Logger;
var model = require('./model');
var checker = require('./proxychecker');



var config = function() {
  return new model.FileConfig();

};

/*
 * Async load of a proxy file - main method of this module
 *
 * conf					Config used for analysing the proxies - see defaultConfig
 * endCallback   callback to used at the end of the process, can have 2 args :
 * 	 error  				if the file doesn't exist or if the fils is not well structured
 *  	listProxy			an object based on ProxyList
 *
 *
 */

var loadProxyFile = function(config, endCallback){


    var proxyList = null;

    async.series([
          function(callback){
            if (config.isPersist() && config.removeExistingProxies) {
                config.pm.deleteAll();
            }
            readProxyFile(config.proxyFile, function(error, result){
              proxyList = result;
              callback(error);
            });
          },
          function(callback){
            if (config.hasToCheckProxies) {
              checker.checkAllProxies(proxyList, config.check, function(error) {
                callback(error);
              });
            }
            else {
              callback();
            }
          },
          function(callback) {
            if (config.removeInvalidProxies) {
              proxyList.proxies = _.filter(proxyList.proxies, function(proxy){ return proxy.valid; });
            }
            callback();

          }],
          function(error, results){
                // results is now equal to ['one', 'two']
            log.debug("End of loading proxies");
            
            if (config.isPersist()) {
                log.debug("Persist the proxies into the DB")
                config.pm.insert(proxyList.getProxies());
            }

            endCallback(error, proxyList);
          }
     );
};

/*
 * Read the default proxy file (should be named proxies.txt and be present on the root folder)
 */
var loadDefaultProxies = function(callback) {
  var defaultConfig = config();

  if (fs.existsSync(defaultConfig.proxyFile)) {

    loadProxyFile(defaultConfig, function(error, proxies) {
      callback(error, proxies);
    });
  }
  else {
    callback(new Error("default file proxies.txt not found"));
  }

};

/*
 *  Read a proxy txt file & create a ProxyList
 */
var readProxyFile = function(file, callback) {
  log.debug("read proxy file : " + file);
  fs.readFile(file, function(error, data) {
      if (error) {
        log.error("Impossible to read the proxy file : " + file + " error : " + error);
        callback(error);
        return;
      }
      var lines = data.toString().split('\n');

      var proxyList = new model.ProxyList();

    for (var i=0; i < lines.length; i++) {

        // Ignore blank lines & comments
        if (lines[i] == "" || lines[i].charAt(0) == '#')  {
          continue;
        }

      var proxyInfo =  lines[i].split(":");

      if (proxyInfo.length  != 4 && proxyInfo.length  != 2) {
        log.error("Incorrect line : " + lines[i] + "in file : " + file);
        //If one line in the proxy file is not well formated => enjoying an error
        callback(new Error("Incorrect structure in the proxy file : " + file));
        return;

       }
       else {

         var proxy = new model.Proxy().fromArray(proxyInfo);
        proxyList.push( proxy);
      }
    }

      callback(null,proxyList);
  });
};



module.exports.loadDefaultProxies =  loadDefaultProxies;
module.exports.loadProxyFile = loadProxyFile;
module.exports.config = config;
