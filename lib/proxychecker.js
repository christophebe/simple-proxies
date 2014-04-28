/*
 *  Check if proxies are valid in function of different options set into the config :
 *
 *  - Ping
 *  - Test a request trough the proxy on Google
 *  - Check if the proxy is banned by Google
 *
 *
 * Not yet implemented :
 * - Check if the proxy is not banned by Google
 *
 */

var request = require("request");
var ping = require ("net-ping");
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

        checkProxy(proxy, config,  function(){
          callback();
        });
      },

      function(error){
        log.debug("*********** end of checkAllProxies");
          endCallback(error);
      }
  );


};


/*
 *  Check one proxy, mainly a ping & a simple request
 */
var checkProxy = function(proxy, config, callback) {
   //log.debug("Check proxy : " + proxy.toString());
  if(config.checkPing) {
    config.pingSession.pingHost (proxy.host, function (error, host, sent, rcvd) {
      var ms = rcvd - sent;
      if (error) {
        if (error instanceof ping.RequestTimedOutError) {
          log.debug(host + ": Timeout (ms=" + ms + ")");
        }
        else {
          log.debug(host + ": not alive  (ms=" + ms + ") : " + error);
          proxy.valid = false;
          callback();
        }
      }
      else {
         log.debug (host + ": is alive (ms=" + ms + ")");
         checkRequest(proxy, config, callback);

      }

    });

   }
   else {
     checkRequest(proxy, config, callback);
   }

};

/*
 * Try to make a request with the proxy on the famous site called Google
 *
 */
var checkRequest = function(proxy, config, callback) {


  request.get({
        uri: config.googleAdress,
        timeout : config.proxyRequestTimeout,
        proxy : proxy.getUrl()
        },

       function (error, response, body) {

        if (error || response.statusCode != 200) {
          log.debug("Invalid request through the proxy : " + proxy.toString());
          proxy.valid = false;
        }
        else {

          log.debug("valid proxy request to Google : " + proxy.toString());
          // TODO : Check if the proxy ip is blocked by Google (captcha)
          proxy.valid = true;
          //console.log(body);
        }
        callback();

      }

  );
};


module.exports.checkAllProxies = checkAllProxies
module.exports.checkProxy = checkProxy
