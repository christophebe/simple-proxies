const shuffle = require('shuffle-array');

// ****************************************************************
// ProxyList
// ****************************************************************
export class ProxyList {
  constructor() {
    this.proxyIndex = -1;
    this.proxies = [];
  }

  push(proxy) {
    this.proxies.push(proxy);
  }

  getProxy() {
    this.proxyIndex++;

    if (this.proxyIndex === (this.proxies.length - 1)) {
      this.proxyIndex = 0;
    }

    return this.proxies[this.proxyIndex];
  }

  pick() {
    return shuffle.pick(this.proxies);
  }

  getProxies() {
    return this.proxies;
  }

  getNumberOfProxies() {
    return this.proxies.length;
  }
}

// ****************************************************************
// Proxy
// ****************************************************************
export class Proxy {
  constructor() {
    this.valid = false;
  }
  fromArray(proxyInfo) {
    [ this.host, this.port, this.userName, this.password ] = proxyInfo;

    return this;
  }

  fromJson(proxyInfo) {
    { this.host, this.port, this.userName, this.password } = proxyInfo;
    return this;
  }

  getUrl() {
    if (this.userName && this.password) {
      return `http://${ this.userName }:${ this.password }@${ this.host }:${ this.port }`;
    }

    return `http://${ this.host }:${ this.port }`;
  }

  toString() {
    return `${ this.host }:${ this.port } - valid : ${ this.valid }`;
  }
}

// ****************************************************************
// CheckConfig
// ****************************************************************
export class CheckConfig() {
  contructor()
  this.maxProxies = 30; // max number of proxies to analyse & check in //
  this.googleAdress = 'https://www.google.com/#q=test';
  this.proxyRequestTimeout = 5000;

  setProxyRequestTimeout(value) {
    this.proxyRequestTimeout = value;
    return this;
  }

  setGoogleAdress(value) {
    this.googleAdress = value;
    return this;
  }

  setMaxProxies(value) {
    this.maxProxies = value;
    return this;
  }
}

// ****************************************************************
// FileConfig
// ****************************************************************
export class FileConfig = function() {
  contructor() {
    this.proxyFile = './proxies.txt';
    this.hasToCheckProxies = true;
    this.removeInvalidProxies = true;
    this.persist = false; // If true, add/import the proxies into a persitent store like a db
    this.removeExistingProxies = true; // if persist = true, we remove all existing proxies in the DB
    this.pm = null; // if persist = true, a pm has to implement methods used to persist the proxies
    // see mongoDBStore.js as an exemple

    this.check = new CheckConfig();
  }

  setProxyFile(file) {
    this.proxyFile = file;
    return this;
  }

  setCheckProxies(value) {
    this.hasToCheckProxies = value;
    return this;
  }

  setRemoveInvalidProxies(value) {
    this.removeInvalidProxies = value;
    return this;
  }

  setPm(value) {
    this.persist = true;
    this.pm = value;
    return this;
  }

  isPersist() {
    return this.persist;
  }

  setRemoveExistingProxies(value) {
    this.removeExistingProxies = value;
    return this;
  }
}

// ****************************************************************
// PmConfig
// ****************************************************************
export class PmConfig() {
  contructor() {
    // Check if the proxies are still valid
    // update the attribute valid on the Proxy object
    this.hasToCheckProxies = false;

    this.removeInvalidProxies = false;

    // a pm has to implement methods used to retrieve & persist the proxies
    // see mongoDBStore.js as exemple
    this.pm = null;

    // If hasToCheckProxies && updateProxies
    // => update the proxies status into the DB (valid or not)
    this.updateProxies = true;

    this.check = new CheckConfig();
  }

  setPm(value) {
    this.pm = value;
    return this;
  }

  setHasToCheckProxies(value) {
    this.hasToCheckProxies = value;
    return this;
  }

  setRemoveInvalidProxies(value) {
    this.removeInvalidProxies = value;
    return this;
  }

  setUpdateProxies(value) {
    this.updateProxies = value;
    return this;
  }
}
