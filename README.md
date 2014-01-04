# Simple Management Tool For Proxies 

## Need a proxy list management in your js code ? 

This simple tool loads a list of proxies from a file & get a simple API to use those proxies in your code. 
For example, when you make some HTTP requests (specially in the SEO world), you need to make it through a proxy. 


## An exemple with Request 


```javascript
var proxies = require('simple-proxies');
var request = require("request");

request.get({ 
		uri:'http://www.google.com',
		proxy : proxies.getUrl()
});


```


## API
### Load the proxy list
```javascript
	proxies.loadProxyFile("./proxies.txt");
 ``` 
 
 The structure of the proxy file should be : [host:port:username:password] or [host:port]

### Check proxies 
```javascript
	proxies.checkProxies(true); 
 ``` 
 
If the argument of the method is true, invalid proxies will be removed from the list. 

### Get all Proxies
```javascript
	proxies.getProxies()
 ``` 
 return an array of proxies (json) {userName, password, host, port, status}
 status == 'invalid' if the proxy is not working (can be checked with method : proxies.checkProxies()
 
### Get one of the proxies 
```javascript
	var proxy = proxies.getProxy();
	
	console.log(proxy.getUrl()); //return the complete URL of the proxy : http://username:pwd@host:port
	console.log(proxy.userName); 
	console.log(proxy.password); 
	console.log(proxy.host); 
	console.log(proxy.port); 
	
 ``` 
 
Loop on the proxy list on each call on this method. 

