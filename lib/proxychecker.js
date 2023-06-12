import axios from 'axios'
import pLimit from 'p-limit'

const VALID_HTTP_STATUS = 200
const limit = pLimit(10)

// Check all proxies
export async function checkAllProxies (proxyList, config) {
  const promises = proxyList.getProxies().map(proxy => limit(() => checkProxy(proxy, config)))

  await Promise.all(promises)
}

// Try to make a request with the proxy
export async function checkProxy (proxy, config) {
  const options = {
    url: config.googleAdress,
    timeout: config.proxyRequestTimeout,
    proxy: proxy.getConnectionParams(),
    maxRedirects: 0,
    validateStatus: function (status) {
      return status === VALID_HTTP_STATUS
    }
  }

  try {
    const response = await axios(options)

    if (response.status !== VALID_HTTP_STATUS) {
      console.log(`Check Proxy - Invalid status code for request through the proxy : ${proxy.getUrl()} : ${response.status}`)
      proxy.valid = false

      return
    }

    console.log(`Check Proxy - valid proxy request to Google : ${proxy.getUrl()}`)
    proxy.valid = true
  } catch (e) {
    console.log(`Check Proxy - Error during request through the proxy : ${proxy.getUrl()} : ${e}`)
    proxy.valid = false
  }
}
