/**
 *  This component loads a list of proxies from DB
 *  The result is stored into JS objects : ProxyList & Proxy (see model.js)
 *
 *  This proxy loader can also (not mandatory):
 *   - Check the proxies with the help of the proxychecker.js components
 *   - Refresh the proxy info into the DB
 *
 *  See the PmConfig object (model.js) for get more info on the different options
 *
 * The main methods are :
 *  loadDProxy
 *  config
 *
 */

var fs = require('fs');

var async = require("async");
var _ = require("underscore");

var log = require('./logging').Logger;
var model = require('./model');
var checker = require('./proxychecker');


var config = function() {
  return new model.PmConfig();
};

/*
 * Async load of a proxy from a DB - main method of this module
 *
 * conf					Config used for analysing the proxies - see defaultConfig
 * endCallback   callback to used at the end of the process, can have 2 args :
 * 	 error  				if the file doesn't exist or if the fils is not well structured
 *  	listProxy			an object based on ProxyList
 *
 *
 */

var loadProxies = function(config, endCallback) {

  if (config.check.checkPing) {
     config.pingSession = ping.createSession ({
       retries: 1,
       timeout: config.check.pingTimeout
     });

     config.pingSession.on ("error", function (error) {
      log.error(error);
    });
  };

  var proxyList = null;

  async.series([
        function(callback){
          log.debug("read proxy from the db");
          findProxies(config, function(error, result){
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
            proxyList.proxies = _.filter(proxyList.proxies, function(proxy){ return proxy.valid=true; });
          }
          callback();

        }],
        function(error, results){
          log.debug("End of loading proxies");
          if (config.check.checkPing) {
            config.pingSession.close();
          }
          if (config.hasToCheckProxies && config.updateProxies && proxyList.getProxies().length>0) {
              config.pm.deleteAll();
              config.pm.insert(proxyList.getProxies());
          }

          endCallback(error, proxyList);
        }

  );
};


/*
 *  Read a proxy txt file & create a ProxyList
 */
var findProxies = function(config, callback) {

  config.pm.findAll(function(error, proxies) {

      if (error) {
        log.error("Impossible to read the proxies from the db : " + error);
        callback(error);
        return;
      }

      var proxyList = new model.ProxyList();
      if (proxies.length==0) {
          log.debug("No proxy found in the DB");
      }

      for (var i=0; i < proxies.length; i++) {
          var proxy = new model.Proxy().fromJson(proxies[i]);
          proxyList.push(proxy);
      }

      callback(null,proxyList);
  });

};


module.exports.loadProxies = loadProxies;
module.exports.config = config;
