var fs = require('fs');
var request = require("request"); 
var ping = require ("net-ping");

var async = require("async"); 
var _ = require("underscore");
var log = require('./lib/logging').Logger;


var defaultConfig = {
		proxyFile : "./proxies.txt", 
		hasToCheckProxies : true, 
		removeInvalidProxies : true, 
		// ping is experimental, sorry guys !, imply to run the apps as sudo
		checkPing : false, 
		checkBannedByGoogle : true,
		pingTimeout : 5000,
		proxyRequestTimeout : 5000,
		googleAdress : "http://www.google.com",
		maxProxies : 30 // max number of proxies to analyse in //
		

};

var cloneConfig = function() {
	return _.clone(defaultConfig);
	
};

/*
 * Async load of a proxy file - main method of this module 
 * 
 * conf						Config used for analysing the proxies - see defaultConfig
 * endCallback  			callback to used at the end of the process, can have 2 args : 
 * 		error  				if the file doesn't exist or if the fils is not well structured 
 *  	listProxy			an object based on ProxyList 
 * 
 * 
 */

var loadProxyFile = function(config, endCallback) {
	
	if (config.checkPing) {
	   config.pingSession = ping.createSession ({
		   retries: 1,
		   timeout: config.pingTimeout
	   });
	   
	   config.pingSession.on ("error", function (error) {
			log.error(error);
		});
	};   
	
	var proxyList = null; 
	async.series([
		    function(callback){
		    	readProxyFile(config.proxyFile, function(error, result){
		    		proxyList = result; 
		    		callback(error); 
		    	});
		    },
		    function(callback){
		    	if (config.hasToCheckProxies) {
		    		checkAllProxies(proxyList, config, function(error) {
		    			callback(error);
		    		});
		    	}
		    	else {
		    		callback();
		    	} 
		    },
		    function(callback) {
				if (config.removeInvalidProxies) {
					proxyList.proxies = _.filter(proxyList.proxies, function(proxy){ return proxy.valid; });
				}
				callback(); 
			
		    }],
			function(error, results){
		  	    // results is now equal to ['one', 'two'] 
				log.debug("********** End of process");
				if (config.checkPing) {
					config.pingSession.close();
				}
				endCallback(error, proxyList); 
			});
};

/*
 * Read the default proxy file (should be named proxies.txt and be present on the root folder)
 */
var loadDefaultProxies = function(callback) {
	if (fs.existsSync(defaultConfig.proxyFile)) {
		loadProxyFile(defaultConfig, function(error, proxies) {
			callback(error, proxies);
		}); 
	}
	else {
		callback(new Error("default file : proxies.txt not found, you have to call the method loadProxyFile in your code")); 
	}

};

/*
 *  Read a proxy txt file & create a ProxyList
 */
var readProxyFile = function(file, callback) {
	log.debug("read proxy file : " + file); 
	fs.readFile(file, function(error, data) { 
  		if (error) {
  			log.error("Impossible to read the proxy file : " + file + " error : " + error); 
  			callback(error);
  			return; 
  		}
  		var lines = data.toString().split('\n');
  		
  		var proxyList = new ProxyList();
	
		for (var i=0; i < lines.length; i++) {	
	
	    	// Ignore blank lines & comments
	    	if (lines[i] == "" || lines[i].charAt(0) == '#')  {
	    		continue;
	    	}
			
			var proxyInfo =  lines[i].split(":");
			
			if (proxyInfo.length  != 4 && proxyInfo.length  != 2) {
				             
				//If one line in the proxy file is not well formated => enjoying an error
				callback(new Error("Incorrect structure in the proxy file : " + file));
				return; 
				
		 	}
		 	else {
		 	
		 		var proxy = new Proxy(proxyInfo);
				proxyList.push( proxy);  
			}	
		}	
  		
  		callback(null,proxyList);
	});
};

/*
 *  Check all proxies 
 */
var checkAllProxies = function (proxyList, config, endCallback) {
	
	async.eachLimit(proxyList.getProxies(), config.maxProxies, 			
			// Iterator on each proxy
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


/*
 *  ProxyList object 
 */
function ProxyList () {
	this.proxyIndex = -1;
    this.proxies = [];
};
	
ProxyList.prototype.push = function(proxy) {
		this.proxies.push(proxy); 
};
    
ProxyList.prototype.getProxy = function() {
	
	//TODO : option : check if the proxy is still working fine ? 
	this.proxyIndex++;
	
	if (this.proxyIndex==(this.proxies.length-1))
		this.proxyIndex=0; 
	
	return this.proxies[this.proxyIndex];    
};
	 
ProxyList.prototype.getProxies = function() {	
	return this.proxies;
};
	

ProxyList.prototype.getNumberOfProxies = function() {
	return this.proxies.length;
};
	
/*
 * Proxy  object 
 */
function Proxy (proxyInfo) {

	 
	this.host = proxyInfo[0];
	this.port = proxyInfo[1];
	// not valid means no checked or the test used to check the proxy was not correct
	// see the method checkProxy
	this.valid = false; 
    
   
    if (proxyInfo.length == 4) {
        this.userName = proxyInfo[2];
        this.password = proxyInfo[3];
     } 
}

Proxy.prototype.getUrl = function() {
	if (this.userName && this.password) 
	  return 'http://' + this.userName + ':' + this.password + '@' + this.host + ':' + this.port;
	else
	  return 'http://' + this.host + ':' + this.port;
      
};

Proxy.prototype.toString = function () {
	return this.host + ":" + this.port ; 
};

/*
 * Check if this module is called from the command line
 * 
 * Output on the console the valid proxies (from a file)
 */
if ( process.argv.length == 3 ) {
	//process.stdout.write('Usage: node proxy.js [file.txt]\n');
	var file = process.argv.slice(2).toString();
	defaultConfig.proxyFile= file; 
	loadProxyFile(defaultConfig, function(error, proxyList) {
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


module.exports.loadDefaultProxies =  loadDefaultProxies; 
module.exports.loadProxyFile = loadProxyFile;
module.exports.cloneConfig = cloneConfig; 


