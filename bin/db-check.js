var async = require("async");
var dbLoader = require("../lib/proxydbloader");
var dbStore = require("../lib/mongoDBStore");
var log = require('../lib/logging').Logger;



function DbChecker(pm) {


  this.config = dbLoader.config()
                        .setPm(pm)
                        .setHasToCheckProxies(true)
                        .setUpdateProxies(true);

}

DbChecker.prototype.check = function() {
    var self = this;
    async.series([
          function(callback){
            self.config.pm.connect(function(error){
                if (error) {
                  log.info("Error : impossible to connect to the DB : " + error);
                  callback(error);
                }
                else {
                  callback();
                }
            });
          },
          function(callback){
            dbLoader.loadProxies(self.config, function(error, proxyList) {
               if (error) {
                 log.info("Error during loading the proxies : " + error);
                 callback(error);
               }
               else {
                 if (proxyList.getProxies().length===0)
                 {
                   log.info("No proxy found in the DB");

                 }
                 else {
                    log.info("***** Proxies available in the DB ***** ");
                    for (var i=0;i<proxyList.getNumberOfProxies(); i++) {
                      // Very simple log on the console in order to copy and past the result
                      log.info(proxyList.proxies[i].toString());
                    }

                 }
                 callback();

               }
           });
          }],
          function(error, results){

            self.config.pm.close();
          }

    );

};

module.exports.DbChecker = DbChecker;
