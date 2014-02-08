
var fs = require('fs');
var request = require("request"); 
var ping = require ("ping");

// Default Adress to check the proxies
var defaultGoogleAdress = "http://www.google.com"; 
var proxyIndex=-1; 
var allProxies = [];


var loadProxyFile = function(file, checkProxies) {
    
    console.log("Load proxies from : " +  file);
    var proxyList = fs.readFileSync(file).toString().split('\n'); // sorry for the sync ;-) 
    
    proxyList.forEach(function(proxyString) {
    	
		var proxy = proxyString.split(":");
		if (proxy.length  != 4 && proxy.length  != 2) {
			if (proxyString != "") // Ignore Empty line			
			console.log('Incorrect structure for the proxy :' + proxy + '. Each line should match to [host:port:username:password] or [host:port]');		
	 	}
	 	else {
			var result =  {  
				host :  proxy[0], 
				port : proxy[1], 
			};
   
			if (proxy.length == 4) {
				result.userName = proxy[2];
				result.password = proxy[3];
			}	

			result.getUrl = function() {
				if (this.userName && this.password) 
					return 'http://' + this.userName + ':' + this.password + '@' + this.host + ':' + this.port;
				else
					return 'http://' + this.host + ':' + this.port;
			};  

			allProxies.push(result);  
			
		}	
    }); 
    
    if (checkProxies) {
    	 checkProxies(true); 
    }
    
};


var getProxy = function() {
	
	//TODO : option : check if the proxy is still working fine ? 
	proxyIndex++;
	
	if (proxyIndex==(proxyList.length-1))
	  proxyIndex=0; 
	
	return allProxies[proxyIndex];    
};

var getProxies = function() {
	return allProxies;
}


var checkProxies = function (removeInvalidProxies) {
	
	allProxies.forEach(function(proxy) {
		checkProxy(proxy, removeInvalidProxies);
	}); 

}

var checkProxy = function(proxy, removeInvalidProxies) {
 	
 	ping.sys.probe(proxy.host, function(isAlive){

        if (isAlive) {
        	checkRequest(proxy, removeInvalidProxies);
        }
        else {
        	console.log("Proxy: "  + proxy.getUrl() + ' - Ping dead ! ');
        	proxy.status = 'invalid'; 
        	if (removeInvalidProxies) {
        		var index = allProxies.indexOf(proxy);
				allProxies.slice(index,1); 
			}
        }
    });	
}

var checkRequest = function(proxy, removeInvalidProxies) {
	request.get({ 
				uri:defaultGoogleAdress,
				proxy : proxy.getUrl()
			  }, 

			 function (error, response, body) {
			 
			 	if (error) 
					console.log("Proxy: " + proxy.getUrl() + " - Invalid Proxy - bad luck :-( : "  + error);  
				else 
				    console.log("Proxy: " + proxy.getUrl() + " - Status : " + response.statusCode );
				
				if ((error || response.statusCode != 200)) {
					proxy.status = 'invalid'; 
					if (removeInvalidProxies) {
				    	var index = allProxies.indexOf(proxy);
				    	allProxies.slice(index,1);
				    } 
				}
				   		    	
			}
			
	);
}	

var getNumberOfProxies = function() {
	return allProxies.length
}

if (fs.existsSync("./proxies.txt")) {
   loadProxyFile("./proxies.txt", true); 
}
else
	console.log("proxies.txt not found, you have to call the method loadProxyFile in your code"); 
		

// Export the public methods
module.exports.loadProxyFile = loadProxyFile;
module.exports.getProxy = getProxy;
module.exports.checkProxies = checkProxies;
module.exports.checkProxy = checkProxy;
module.exports.defaultGoogleAdress; 
module.exports.getNumberOfProxies;