# Simple Management Tool For Proxies

## Need a proxy list management in your js code ?

This package provides a simple API for using HTTP proxies in JS code.
For example, when you make many HTTP requests (specially in the SEO world ;-)), you need to make them through a group of proxies.
The goal of this package is to simplify your code for managing a list of proxies.  

There are 3 components :
* ProxyFileLoader : load proxies from a txt file & store them into JS objects. This component can also import the different proxies into a DB. You can change the configuration by using the object FileConfig.
* ProxyDBLoader : load proxies from a DB & store them into JS Objects. You can change the configuration by using the object PmConfig.
* ProxyChecker : check if proxies are valid & not banned by Google. You can change the configuration by using the object CheckConfig.

##Structure of the txt proxy file

Each line of the file should respect the one of following structure :  
- host:port:username:password
- host:port
- comment with #
- "<blank line>"

##Node Scripts

There also 2 command line scripts in this package :
- valid-proxies : check a list of proxies from a txt file.
- db-importer : read a txt file containing proxies & import proxies into a db.

###How to use thoses scripts ?

- Install Node
- get the code from this Git repo

* For valid-proxies, use the following command line :
```
node valide-proxies.js [/path/file.txt]
```

* For the db-importer :
If needed, change the db connection info into the script db-importer.js
MongoDB is used by default but you can create your own store (see mongoDBStore.js as example).
```
node db-importer.js [/path/file.txt]
```


##How to install this package into your node.js app ?
```javascript
$ npm install simple-proxies [--save]
```
or add it into you package.json :

```javascript
"dependencies": {
       "simple-proxies": "*"
    }

$ npm install

```

## An example with Request


```javascript
var proxyLoader = require("./lib/proxyfileloader");
var request = require("request");

// Change the config if you want to use a specific txt file
// Not necessary if you plan to use proxies.txt on the root folder
var config = proxyLoader.config().setProxyFile("yourfile.txt");

proxyLoader.loadProxyFile(config, function(error, proxyList) {
  if (error) {
    console.log(error);
  }
  else {
     // Make a request with one proxy
     request.get({
         uri:'http://www.google.com',
         proxy : proxyList.getProxy().getUrl()
     });
  }

});


 ```


## API
### Load the default proxy file
```javascript
var proxyLoader = require("./lib/proxyfileloader");
proxyLoader.loadDefaultProxies(function(error, proxyList){ ... });
 ```

By default, the list of proxies are in a file called proxies.txt and it should be in the root folder of your project.


### Read proxies from a specific txt file
```javascript
var proxyLoader = require("simple-proxies/lib/proxyfileloader");
var config = proxies.cloneConfig().setProxyFile(...).setCheckProxies(false);

proxyLoader.loadProxyFile(config, function(error, proxyList) {

});
 ```

The config can be used to personalize how the proxies has to be managed. See FileConfig in model.js to get all options.

### Read proxies from the database

```javascript
var dbLoader = require("simple-proxies/lib/proxydbloader");
var pm = new dbStore.MongoDBProxyStore({"url" : "mongodb://127.0.0.1:27017/seo", "collection" : "proxies"});

var config = dbLoader.config().setPm(pm);
dbLoader.loadProxies(config, function(error, proxyList) {
     console.log(proxies.getNumberOfProxies());
     pm.close();

});

 ```

The config can be used to personalize how the proxies has to be managed. See PmConfig in model.js to get all options.
### The object model

After loading the proxies from a file or from a db, you receive a ProxyList object which contains an array of Proxy objects.


#### Get all Proxies
```javascript
var proxies = proxyList.getProxies();
proxies.forEach(function(proxy) { ... });
 ```
return an array of proxies : {host, port, valid, userName, password}


#### Get one proxy
```javascript
	var proxy = proxyList.getProxy();

	console.log(proxy.getUrl()); //return the complete URL of the proxy : http://username:pwd@host:port
	console.log(proxy.userName);
	console.log(proxy.password);
	console.log(proxy.host);
	console.log(proxy.port);
	console.log(proxy.valid);

 ```

This method loops on the proxy list on each call.

See the model.js to get a complete overview of the API provided by this model.
