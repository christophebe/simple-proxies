var shuffle = require('shuffle-array');

/******************************************************************
 *  ProxyList
 ******************************************************************/
function ProxyList () {
    this.proxyIndex = -1;
    this.proxies = [];
}

ProxyList.prototype.push = function(proxy) {
    this.proxies.push(proxy);
};

ProxyList.prototype.getProxy = function() {

  //TODO : option : check if the proxy is still working fine ?
  this.proxyIndex++;

  if (this.proxyIndex===(this.proxies.length-1)) {
    this.proxyIndex=0;
  }


  return this.proxies[this.proxyIndex];
};

ProxyList.prototype.pick = function() {

  //TODO : option : check if the proxy is still working fine ?
  return shuffle.pick(this.proxies);

};

ProxyList.prototype.getProxies = function() {
  return this.proxies;
};


ProxyList.prototype.getNumberOfProxies = function() {
  return this.proxies.length;
};


/******************************************************************
 *  Proxy
 ******************************************************************/
function Proxy () {
  this.valid = false;
}

Proxy.prototype.fromArray= function (proxyInfo) {

  this.host = proxyInfo[0];
  this.port = proxyInfo[1];

  if (proxyInfo.length === 4) {
      this.userName = proxyInfo[2];
      this.password = proxyInfo[3];
  }

  return this;

};

Proxy.prototype.fromJson = function (proxyInfo) {

  this.host = proxyInfo.host;
  this.port = proxyInfo.port;

  if (proxyInfo.userName && proxyInfo.password) {
      this.userName = proxyInfo.userName;
      this.password = proxyInfo.password;
  }

  return this;

};

Proxy.prototype.getUrl = function() {
  if (this.userName && this.password) {
    return 'http://' + this.userName + ':' + this.password + '@' + this.host + ':' + this.port;
  }
  else {
    return 'http://' + this.host + ':' + this.port;
  }


};

Proxy.prototype.toString = function () {
  return this.host + ":" + this.port + " - valid : " + this.valid ;
};


/******************************************************************
 *  CheckConfig
 ******************************************************************/
var CheckConfig = function () {
  this.maxProxies = 30;   // max number of proxies to analyse & check in //
  this.googleAdress = "https://www.google.com/#q=test";
  this.proxyRequestTimeout = 5000;


  this.setProxyRequestTimeout = function (value) {
    this.proxyRequestTimeout = value;
    return this;
  };

  this.setGoogleAdress = function (value) {
    this.googleAdress = value;
    return this;

  };

  this.setMaxProxies = function (value) {
    this.maxProxies = value;
    return this;
  };

};


/******************************************************************
 *  FileConfig
 ******************************************************************/
var FileConfig = function () {
    this.proxyFile = "./proxies.txt";
    this.hasToCheckProxies = true;
    this.removeInvalidProxies = true;
    this.persist = false; // If true, add/import the proxies into a persitent store like a db
    this.removeExistingProxies = true; // if persist = true, we remove all existing proxies in the DB
    this.pm = null;  // if persist = true, a pm has to implement methods used to persist the proxies
                     // see mongoDBStore.js as an exemple

    this.check = new CheckConfig();

    this.setProxyFile = function (file) {
      this.proxyFile = file;
      return this;
    };

    this.setCheckProxies = function (value) {
        this.hasToCheckProxies = value;
        return this;
    };

    this.setRemoveInvalidProxies = function (value) {
      this.removeInvalidProxies = value;
      return this;
    };

    this.setPm = function(value) {
      this.persist = true;
      this.pm = value;
      return this;
    };

    this.isPersist = function() {
      return this.persist;
    };

    this.setRemoveExistingProxies = function (value) {
      this.removeExistingProxies = value;
      return this;
    };

};


/******************************************************************
 *  PmConfig
 ******************************************************************/
var PmConfig = function () {
    // Check if the proxies are still valid
    // update the attribute valid on the Proxy object
    this.hasToCheckProxies = false;

    this.removeInvalidProxies = false;

    // a pm has to implement methods used to retrieve & persist the proxies
    // see mongoDBStore.js as exemple
    this.pm = null;

    // If hasToCheckProxies && updateProxies
    //=> update the proxies status into the DB (valid or not)
    this.updateProxies = true;

    this.check = new CheckConfig();

    this.setPm = function(value) {
      this.pm = value;
      return this;
    };

    this.setHasToCheckProxies = function (value) {
      this.hasToCheckProxies = value;
      return this;
    };

    this.setRemoveInvalidProxies = function (value) {
      this.removeInvalidProxies = value;
      return this;
    };

    this.setUpdateProxies = function (value) {
      this.updateProxies = value;
      return this;
    };
};

module.exports.ProxyList = ProxyList;
module.exports.Proxy = Proxy;
module.exports.FileConfig = FileConfig;
module.exports.PmConfig = PmConfig;
module.exports.CheckConfig = CheckConfig;
