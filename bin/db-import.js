/*
 * Import in a DB all proxies loaded from a file
 * You can change the config used to load the proxies,
 * see in the file model.js the FileConfig object
 *
 */
var fileLoader = require("../lib/proxyfileloader");
var log = require('../lib/logging').Logger;


function DbImport(file, pm) {

  this.config = fileLoader.config()
                   .setProxyFile(file)
                   .setRemoveInvalidProxies(false)
                   .setPm(pm);

}

DbImport.prototype.import = function() {

    var self = this;

    this.config.pm.connect(function(error){
        if (error) {
            log.error("Error : impossible to connect to the DB : " + error);
            return;
        }

        fileLoader.loadProxyFile(self.config, function(error, proxyList) {

            if (error) {
              log.error("Error during loading the proxies : " + error);
            }
            else {
              console.log("***** List of proxies that have been imported in the DB ***** ");
              proxyList.getProxies().forEach(function(proxy){
                // Very simple log on the console to check the result
                console.log(proxy.toString());
              });
              self.config.pm.close();
            }

        });
    });

}

module.exports.DbImport = DbImport;
