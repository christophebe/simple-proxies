import shuffle from 'shuffle-array'

// ****************************************************************
// ProxyList
// ****************************************************************
export class ProxyList {
  constructor () {
    this.proxyIndex = -1
    this.proxies = []
  }

  push (proxy) {
    this.proxies.push(proxy)
  }

  getProxy () {
    this.proxyIndex++
    const p = this.proxies[this.proxyIndex]

    if (this.proxyIndex === (this.proxies.length - 1)) {
      this.proxyIndex = -1
    }

    return p
  }

  pick () {
    return shuffle.pick(this.proxies)
  }

  getProxies () {
    return this.proxies
  }

  setProxies (proxies) {
    this.proxies = proxies
  }

  getNumberOfProxies () {
    return this.proxies.length
  }
}

// ****************************************************************
// Proxy
// ****************************************************************
export class Proxy {
  constructor () {
    this.valid = false
  }

  fromArray (proxyInfo) {
    [this.host, this.port, this.userName, this.password] = proxyInfo

    return this
  }

  fromJson (proxyInfo) {
    this.host = proxyInfo.host
    this.port = proxyInfo.port
    this.userName = proxyInfo.userName
    this.password = proxyInfo.password

    return this
  }

  getUrl () {
    if (this.userName && this.password) {
      return `http://${this.userName}:${this.password}@${this.host}:${this.port}`
    }

    return `http://${this.host}:${this.port}`
  }

  getConnectionParams () {
    const info = {
      host: this.host,
      port: this.port
    }

    if (this.userName && this.password) {
      info.auth = {
        username: 'username',
        password: 'password'
      }
      return info
    }
  }

  toString () {
    return `${this.host}:${this.port} - valid : ${this.valid}`
  }
}

// ****************************************************************
// CheckConfig
// ****************************************************************
export class CheckConfig {
  constructor () {
    // max number of proxies to analyse & check in //
    this.maxProxies = 30
    this.googleAdress = 'https://www.google.com/#q=test'
    this.proxyRequestTimeout = 5000
  }

  setProxyRequestTimeout (value) {
    this.proxyRequestTimeout = value

    return this
  }

  setGoogleAdress (value) {
    this.googleAdress = value

    return this
  }

  setMaxProxies (value) {
    this.maxProxies = value

    return this
  }
}

// ****************************************************************
// FileConfig
// ****************************************************************
export class FileConfig {
  constructor () {
    this.proxyFile = './proxies.txt'
    this.hasToCheckProxies = true
    this.removeInvalidProxies = true
    this.check = new CheckConfig()
  }

  setProxyFile (file) {
    this.proxyFile = file

    return this
  }

  setCheckProxies (value) {
    this.hasToCheckProxies = value

    return this
  }

  setRemoveInvalidProxies (value) {
    this.removeInvalidProxies = value

    return this
  }

  setPm (value) {
    this.persist = true
    this.pm = value

    return this
  }

  isPersist () {
    return this.persist
  }

  setRemoveExistingProxies (value) {
    this.removeExistingProxies = value

    return this
  }
}
