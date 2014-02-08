# Simple Management Tool For Proxies 

## Need a proxy list management in your js code ? 

This simple tool loads a list of proxies from a file & get a simple API to use them in your JS code. 
For example, when you make many HTTP requests (specially in the SEO world), you need to make them through a group of proxies. 

By using this module, you can load your proxies, check if they are alive and get one from the list. 


##How to install
```javascript
$ npm install simple-proxies
```
or add in you package.json :
 
```javascript
"dependencies": {
       "simple-proxies": "*"
    }
```

## An exemple with Request 


```javascript
var proxies = require('simple-proxies');
var request = require("request");

request.get({ 
		uri:'http://www.google.com',
		proxy : proxies.getUrl()
});

By default, the list of proxies are in the file called proxies.txt that should be in the root folder of your project. 

```


## API
### Load the proxy list
```javascript
	proxies.loadProxyFile("./proxies.txt");
 ``` 
 
 The structure of each line in the proxy file should be : [host:port:username:password] or [host:port]
 This method is automatically called if the file proxies.txt exists in the root folder of your project. 

### Check proxies 
```javascript
	proxies.checkProxies(true); 
 ``` 
Check each proxy in the list : ping & execute one request on google.com.  
If the argument of the method is true, invalid proxies will be removed from the list. 

This method is automatically called if the file proxies.txt exists in the root folder of your project. 

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

