/*
 *  Check if proxies are valid in function of different options set into the config :
 *
 *  - Ping
 *  - Test a request trough the proxy on Google
 *
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
          endCallback();
      }
  );


};


/*
 *  Check one proxy, mainly a ping & a simple request
 */
var checkProxy = function(proxy, config, endCallback) {

    async.waterfall([
        function(callback){

            if(config.checkPing) {
              log.debug("Ping proxy : "  + proxy.getUrl());
              config.pingSession.pingHost (proxy.host, function (error, host, sent, rcvd) {
                var ms = rcvd - sent;
                if (error) {
                  if (error instanceof ping.RequestTimedOutError) {
                    log.debug(host + ": Timeout (ms=" + ms + ")");
                  }
                  else {
                    log.debug(host + ": not alive  (ms=" + ms + ") : " + error);
                  }
                  proxy.valid = false;
                  callback(error);
                }
                else {
                   callback();

                }

              });

            }
            else {
              callback();
            }
            //callback(null, 'one', 'two');
        },
        function(callback){
          checkRequest(config.googleAdress,proxy, config,callback);

        }],
        function (error, result) {
            endCallback();
        });

};

/*
 * Try to make a request with the proxy
 *
 */
var checkRequest = function(url, proxy, config, callback) {

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
