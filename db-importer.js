/*
 * Import in a DB all proxies loaded from a file
 * You can change the config used to load the proxies,
 * see in the file model.js the FileConfig object
 *
 */


var fileLoader = require("./lib/proxyfileloader");
var dbStore = require("./lib/mongoDBStore");
var log = require('./lib/logging').Logger;

if ( process.argv.length != 3 ) {
   log.error('Usage: node db-importer.js [file.txt]\n');
   return;
}

dbConfig = {
   "url" : "mongodb://127.0.0.1:27017/seo",
   "collection" : "proxies"
}


var pm = new dbStore.MongoDBProxyStore(dbConfig);
var file = process.argv.slice(2).toString();
var config = fileLoader.config()
                 .setProxyFile(file)
                 .setRemoveInvalidProxies(false)
                 .setPm(pm);


config.pm.connect(function(error){
    if (error) {
      log.error("Error : impossible to connect to the DB : " + error);
      return;
    }

    fileLoader.loadProxyFile(config, function(error, proxyList) {
      if (error) {
        log.error("Error during loading the proxies : " + error);
      }
      else {
        console.log("***** List of proxies that have been imported in the DB ***** ");
        proxyList.getProxies().forEach(function(proxy){
          // Very simple log on the console to check the result
          console.log(proxy.toString());
        });
        pm.close();
      }

    });
});
