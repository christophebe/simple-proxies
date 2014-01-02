var fs = require('fs');

var proxyIndex=-1; 
var proxyList;


var loadProxyFile = function(file) {
    proxyList = fs.readFileSync(file).toString().split('\n'); 
};


var getProxy = function() {
	
	proxyIndex++;
	
	if (proxyIndex==proxyList.length)
	  proxyIndex=0; 
	 
	var proxy = proxyList[proxyIndex].split(":");
	if (proxy.lenght != 4 && proxy.lenght != 2) 
		throw new Error('Incorrect structure for the proxy file. Each line should match to [host:port:username:password] or [host:port]');
	 
	var result =  {  
		host :  proxy[0], 
		port : proxy[1], 
	};
		   
	if (proxy.lenght == 4) {
		result.userName = proxy[2];
		result.password = proxy[3];
	}	
	
	result.getUrl = function() {
    	if (userName && password) 
			return 'http://' + this.userName + ':' + this.password + '@' + this.host + ':' + this.port;
		else
			return 'http://' + this.host + ':' + this.port;
	};
	
	
	return result;    
};

if (fs.existsSync("./proxies.txt"))
   loadProxyFile("./proxies.txt"); 
else
	console.log("proxies.txt not found"); 

module.exports.loadProxyFile = loadProxyFile;
module.exports.getProxy = getProxy;