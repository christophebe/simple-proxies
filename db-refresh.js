
var dbLoader = require("./lib/proxydbloader");
var dbStore = require("./lib/mongoDBStore");

dbConfig = {
   "url" : "mongodb://127.0.0.1:27017/seo",
   "collection" : "proxies"
}


var pm = new dbStore.MongoDBProxyStore(dbConfig);


var config = dbLoader.config()
                     .setPm(pm)
                     .setHasToCheckProxies(true)
                     .setUpdateProxies(true);


config.pm.connect(function(error){
    if (error) {
      console.log("Error : impossible to connect to the DB : " + error);
      return;
    }

    dbLoader.loadProxies(config, function(error, proxyList) {
       if (error) {
         console.log(error);
       }
       else {
         if (proxyList.getProxies().length==0)
         {
           console.log("No proxy found in the DB");

         }
         else {
            console.log("***** Proxies available in the DB ***** ");
            proxyList.getProxies().forEach(function(proxy){
              // Very simple log on the console in order to copy and past the result
              console.log(proxy.toString());
            });
         }

       }
       pm.close();

     });
});
