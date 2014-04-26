/*
 * Import in a DB all proxies loaded from a file
 * You can change the config used to load the proxies,
 * see in the file model.js the FileConfig object
 *
 */


var fileLoader = require("./proxyfileloader");
var dbStore = require("./mongoDBStore");


if ( process.argv.length != 3 ) {
   console.log('Usage: node db-importer.js [file.txt]\n');
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
      console.log("Error : impossible to connect to the DB : " + error);
      return;
    }

    fileLoader.loadProxyFile(config, function(error, proxyList) {
      if (error) {
        console.log("Error during loading the proxies : " + error);
      }
      else {
        console.log("***** List of valid proxies, also available in the DB ***** ");
        proxyList.getProxies().forEach(function(proxy){
          // Very simple log on the console to check the result
          console.log(proxy.toString());
        });
        pm.close(); 
      }

    });
});
