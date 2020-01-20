This module provides a simple API for using HTTP proxies in a NodeJS application.

For example, when you make many HTTP requests (specially in the SEO world ;-)), you need to make them through a group of proxies.
The goal of this package is to simplify your code for managing a list of proxies : load proxies, get ramdomly one proxy, check proxies, ...

## Install

```
npm install simple-proxies
```

##Structure of the txt proxy file

Each line of the file should respect the one of following structure :

- host:port:username:password
- host:port
- comment with #
- blank line

## Using proxies in your own app

There are 2 components :

- ProxyFileLoader : load proxies from a txt file & store them into a JS object.
- ProxyChecker : check if proxies are valid & not banned by Google.

### An example with Request

```javascript
const proxyLoader = require('simple-proxies/lib/proxyfileloader');
const request = require('request');

// Change the config if you want to use a specific txt file
// This is not necessary if you plan to use proxies.txt on the current folder
const config = proxyLoader.config().setProxyFile('yourfile.txt');

const proxyList = await proxyLoader.loadProxyFile(config);

// Make a request with one proxy
const response = request.get({ uri: 'http://www.xxx.com', proxy: proxyList.getProxy().getUrl() });
```

### API

#### Load the default proxy file

```javascript
const proxyLoader = require('simple-proxies/lib/proxyfileloader');
const proxyList = await proxyLoader.loadDefaultProxies();
const proxies = proxyList.getProxies();
```

By default, the list of proxies are in a file called proxies.txt and it should be in the root folder of your project.

#### Read proxies from a specific txt file

```javascript
var proxyLoader = require('simple-proxies/lib/proxyfileloader');
var config = proxies
  .config()
  .setProxyFile('filename.txt')
  .setCheckProxies(false);

const proxyList = await proxyLoader.loadProxyFile(config);
```

The config can be used to personalize how the proxies have to be managed. See FileConfig in model.js to get all options.

#### The object model

After loading the proxies from a file or from a db, you receive a **ProxyList** object which contains an array of Proxy objects.

**Get all Proxies**

```javascript
var proxies = proxyList.getProxies();
proxies.map(proxy => console.log(proxy)); // return an array of proxies : {host, port, valid, userName, password}
```

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

**Get one proxy randomly**

```javascript
var proxy = proxyList.pick();

console.log(proxy.getUrl()); //return the complete URL of the proxy : http://username:pwd@host:port
console.log(proxy.userName);
console.log(proxy.password);
console.log(proxy.host);
console.log(proxy.port);
console.log(proxy.valid);
```

See the model.js to get a complete overview of the API provided by this model.

#### Check the proxies

Anywhere in your code or in a cron, you can check if the proxies are still valid by using the proxy checker.
This component uses a ProxyList to make the check.

```javascript
var checker = require('simple-proxies/lib/proxychecker');
const proxyLoader = require('simple-proxies/lib/proxyfileloader');

const proxyList =  await proxyLoader.loadDefaultProxies();
var config = checker.config().setGoogleAdress('http://www.google.be');
await checker.checkAllProxies(proxyList, config, function(error) {
//the proxies in proxyList should be updated (valid or not valid)

```

The config can be used to personalize how the proxies has to be checked. See CheckConfig in model.js to get all options.
