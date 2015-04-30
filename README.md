This project aims to solve 2 problems
- **A command line tool for managing proxies** from a file or a db. Currently, basic commands are provided to check & import proxies. We plan to add more commands.
- A **nodejs component** for using proxies in your apps.

Basic ! but do the job !


## Install

In order to use the command line :
```
npm install simple-proxies -g
```

In order to use the component inside your nodejs app :
```
npm install simple-proxies --save
```

##Structure of the txt proxy file

Each line of the file should respect the one of following structure :  
- host:port:username:password
- host:port
- comment with #
- blank line


## Command Line Tools

### Check proxies that are in a text file
If you want to check if the proxies are valid, run the following command :
```
px fcheck
```
This command will ask you the location of the file to check (default : ./proxies.txt)

### Import proxies in a db from a file
```
px dimport
```
Currently, we are supporting MongoDB & Riak.
This command will ask your the DB connexion infos & the file to used.

### Check proxies that are in a db
```
px dcheck
```
This command will ask your the DB connexion infos



## Using proxies in your own app

This package provides a simple API for using HTTP proxies in a NodeJS application. For example, when you make many HTTP requests (specially in the SEO world ;-)), you need to make them through a group of proxies.
The goal of this package is to simplify your code for managing a list of proxies.  

There are 3 components :
* ProxyFileLoader : load proxies from a txt file & store them into JS objects. This component can also import the different proxies into a DB.
* ProxyDBLoader : load proxies from a DB & store them into JS Objects.
* ProxyChecker : check if proxies are valid & not banned by Google.



### An example with Request


```javascript
var proxyLoader = require("simple-proxies/lib/proxyfileloader");
var request = require("request");

// Change the config if you want to use a specific txt file
// This is not necessary if you plan to use proxies.txt on the current folder
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


### API
#### Load the default proxy file
```javascript
var proxyLoader = require("simple-proxies/lib/proxyfileloader");
proxyLoader.loadDefaultProxies(function(error, proxyList){  
    var proxies = proxyList.getProxies();
});
 ```

By default, the list of proxies are in a file called proxies.txt and it should be in the root folder of your project.


#### Read proxies from a specific txt file
```javascript
var proxyLoader = require("simple-proxies/lib/proxyfileloader");
var config = proxies.config().setProxyFile("filename.txt").setCheckProxies(false);

proxyLoader.loadProxyFile(config, function(error, proxyList) {

});
 ```

The config can be used to personalize how the proxies has to be managed. See FileConfig in model.js to get all options.

#### Read proxies from the database

```javascript
var dbLoader = require("simple-proxies/lib/proxydbloader");
var dbStore = require("./lib/mongoDBStore");
var pm = new dbStore.MongoDBProxyStore({"url" : "mongodb://127.0.0.1:27017/seo", "collection" : "proxies"});

var config = dbLoader.config().setPm(pm);
dbLoader.loadProxies(config, function(error, proxyList) {
     console.log(proxies.getNumberOfProxies());
     pm.close();

});

 ```

The config can be used to personalize how the proxies has to be managed. See PmConfig in model.js to get all options.
#### The object model

After loading the proxies from a file or from a db, you receive a **ProxyList** object which contains an array of Proxy objects.


**Get all Proxies**
```javascript
var proxies = proxyList.getProxies();
proxies.forEach(function(proxy) { ... });
 ```
return an array of proxies : {host, port, valid, userName, password}


**Get one proxy**
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


#### Check the proxies

Anywhere in your code or in a cron, you can check if the proxies are still valid by using the proxy checker.
This component uses a ProxyList to make the check.

```javascript
var checker = require("simple-proxies/lib/proxychecker");

var config = checker.config().setGoogleAdress("http://www.google.be");
checker.checkAllProxies(proxyList, config, function(error) {
    //the proxies in proxyList should be updated (valid or not valid)

});

 ```
The config can be used to personalize how the proxies has to be checked. See CheckConfig in model.js to get all options.
