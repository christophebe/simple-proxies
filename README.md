# Simple Management Tool For Proxies 

## Need a proxy list management in your js code ? 

This simple tool loads a list of proxies from a file & get a simple API to use them in your JS code. 
For example, when you make many HTTP requests (specially in the SEO world), you need to make them through a group of proxies. 

By using this module, you can load your proxies from a file, check if they are alive and get one from the list to make a request.  

Each line of the file should respect the one of following structure :  
host:port:username:password
host:port
comment with # 
<blank line>

##How to install
```javascript
$ npm install simple-proxies
```
or 

add in you package.json :
 
```javascript
"dependencies": {
       "simple-proxies": "*"
    }

$ npm install

```

## An example with Request 


```javascript
var proxies = require('simple-proxies');
var request = require("request");

// Load the default proxy file
proxies.loadDefaultProxies(function(error, proxyList) {
     		
     		console.log("The proxy list : " + proxyList.getProxies()); 
     	 	
});


// Make a request with one valid proxy 
request.get({ 
		uri:'http://www.google.com',
		proxy : proxyList.getProxy().getUrl()
});
 ``` 


## API
### Load the default proxy file
```javascript
	proxies.loadDefaultProxies(function(error, proxyList){ ... });
 ```

By default, the list of proxies are in a file called proxies.txt and it should be in the root folder of your project. 


### Read a specific file & change the config 
```javascript
	var proxies = require('simple-proxies');
	var config = proxies.cloneConfig();
    config.proxyFile = "./test/files/invalidformat.txt";
    proxies.loadProxyFile(config, function(error, proxyList) { 
      		
      	});
 ``` 

The config can be used to personalize how the proxies has to be managed. Here is the attributes that you can change : 

```javascript
var config = {
		proxyFile : "./proxies.txt", // location of the file
		hasToCheckProxies : true,  // if false, proxies are not checked
		removeInvalidProxies : true,  // if false, invalide proxies are not removes from the list
		checkPing : false, // if true, a ping check (hasToCheckProxies has to = true)
		checkBannedByGoogle : true, //if true, check if the proxy is banned by Google (hasToCheckProxies has to = true)
		pingTimeout : 5000, // Timout for the ping
		proxyRequestTimeout : 5000, // Request timout used to test the request through the proxy
		googleAdress : "http://www.google.com", // a site to test the proxy, feel freel to use your own site
		maxProxies : 30 // max number of proxies to analyse in //
		

};
```


### Get all Proxies
```javascript
	proxyList.getProxies()
 ``` 
return an array of proxies : {host, port, valid, userName, password}

 
### Get one of the proxies 
```javascript
	var proxy = proxies.getProxy();
	
	console.log(proxy.getUrl()); //return the complete URL of the proxy : http://username:pwd@host:port
	console.log(proxy.userName); 
	console.log(proxy.password); 
	console.log(proxy.host); 
	console.log(proxy.port); 
	console.log(proxy.valid); 
	
 ``` 
 
This method loops on the proxy list on each call. 

