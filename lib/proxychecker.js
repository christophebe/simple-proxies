// Check if proxies are valid in function of different options set into the config :
// - Test a request trough the proxy on Google

const request = require('request-promise-native');
const Parrarel = require('async-parallel');
const log = require('./logging.js').Logger;

const VALID_HTTP_STATUS = 200;

// Check all proxies
async function checkAllProxies(proxyList, config) {
  await Parrarel.each(proxyList.getProxies(), async (proxy) => await checkProxy(proxy, proxy), config.maxProxies);
}

// Try to make a request with the proxy
async function checkProxy(proxy, config) {
  const options = {
    uri: config.googleAdress,
    timeout: config.proxyRequestTimeout,
    proxy: proxy.getUrl(),
    resolveWithFullResponse: true
  };

  try {
    const response = await request(options);

    if (response.statusCode !== VALID_HTTP_STATUS) {
      log.debug(`Check Proxy - Invalid status code for request through the proxy : ${ proxy.getUrl() } : ${ response.statusCode }`);
      proxy.valid = false;

      // TODO : throws an error ?

      return;
    }

    log.debug(`Check Proxy - valid proxy request to Google : ${ proxy.getUrl() }`);
    proxy.valid = true;
  } catch (e) {
    log.debug(`Check Proxy - Error during request through the proxy : ${ proxy.getUrl() } : ${ e }`);
    proxy.valid = false;

    // TODO : throws an error ?
  }
}

exports.checkAllProxies = checkAllProxies;

exports.checkProxy = checkProxy;
