
var dbLoader = require("./lib/proxydbloader");
var dbStore = require("./lib/mongoDBStore");
var async = require("async");
var log = require('./lib/logging').Logger;

dbConfig = {
   "url" : "mongodb://127.0.0.1:27017/seo",
   "collection" : "proxies"
}


var pm = new dbStore.MongoDBProxyStore(dbConfig);


var config = dbLoader.config()
                     .setPm(pm)
                     .setHasToCheckProxies(true)
                     .setUpdateProxies(true);


async.series([
      function(callback){
        config.pm.connect(function(error){
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
        dbLoader.loadProxies(config, function(error, proxyList) {
           if (error) {
             log.info("Error during loading the proxies : " + error);
             callback(error);
           }
           else {
             if (proxyList.getProxies().length==0)
             {
               log.info("No proxy found in the DB");

             }
             else {
                log.info("***** Proxies available in the DB ***** ");
                for (i=0;i<proxyList.getNumberOfProxies(); i++) {
                  // Very simple log on the console in order to copy and past the result
                  log.info(proxyList.proxies[i].toString());
                };

             }
             callback();

           }
       });
      }],
      function(error, results){
        pm.close();
      }

);
