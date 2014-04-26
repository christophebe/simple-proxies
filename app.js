var proxyLoader = require("./proxyfileloader");

/*
 * Output on the console the valid proxies loaded from a file
 * You can change the config used to load the proxies,
 * see in the file proxyloader.js the defaultConfig
 */
if ( process.argv.length == 3 ) {
	//process.stdout.write('Usage: node app.js [file.txt]\n');
	var file = process.argv.slice(2).toString();
  var config = proxyLoader.config().setProxyFile(file);
	proxyLoader.loadProxyFile(config, function(error, proxyList) {
		if (error) {
			console.log(error);
		}
		else {
			console.log("***** List of valid proxies ***** ");
			proxyList.getProxies().forEach(function(proxy){
				// Very simple log on the console in order to copy and past the result
				console.log(proxy.toString());
			});
		}

	});
}
