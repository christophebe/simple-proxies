/*
 *  Check if proxies are valid in function of different options set into the config :
 *
 *  - Test a request trough the proxy on Google
 *
 *
 */

var request = require("request");
var async = require("async");

var log = require('./logging').Logger;

var config = function() {
  return new model.CheckConfig();
};


/*
 *  Check all proxies
 */
var checkAllProxies = function (proxyList, config, endCallback) {

  async.eachLimit(proxyList.getProxies(), config.maxProxies,

      function(proxy, callback) {
        checkProxy(config.googleAdress,proxy, config,callback);
      },

      function(error){
          endCallback();
      }
  );


};



/*
 * Try to make a request with the proxy
 *
 */
var checkProxy = function(url, proxy, config, callback) {

  request.get({
        uri: url,
        timeout : config.proxyRequestTimeout,
        proxy : proxy.getUrl()
        },

       function (error, response, body) {
        if (error) {
          log.debug("Check Proxy - Error during request through the proxy : " +
                     proxy.getUrl() + " : " + error );
          proxy.valid = false;
          callback(error);
          return;
        }

        if (response.statusCode != 200) {

          log.debug("Check Proxy - Invalid status code for request through the proxy : " +
                    proxy.getUrl() + " : " + response.statusCode );
          proxy.valid = false;
          callback(new Error("Invalid status code : " + response.statusCode));
          return;
        }

        log.debug("Check Proxy - valid proxy request to Google : " + proxy.getUrl()  );

        proxy.valid = true;
        callback();

      });
};


module.exports.checkAllProxies = checkAllProxies
module.exports.checkProxy = checkProxy
