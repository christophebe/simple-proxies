/**
 *  This component loads a list of proxies from a txt file
 *
 */
import fs from 'fs'
import util from 'util'
import { ProxyList, Proxy, FileConfig } from './model.js'
import { checkAllProxies } from './proxychecker.js'

const readFile = util.promisify(fs.readFile)

export function config () {
  return new FileConfig()
}
export async function loadProxyFile (config) {
  const proxyList = await readProxyFile(config.proxyFile)

  if (config.hasToCheckProxies) {
    await checkAllProxies(proxyList, config.check)
  }

  if (config.removeInvalidProxies) {
    proxyList.proxies = proxyList.proxies.filter(p => p.valid)
  }

  return proxyList
}

// Read the default proxy file (should be named proxies.txt and be present on the root folder)
export async function loadDefaultProxies () {
  const defaultConfig = new FileConfig()

  return await loadProxyFile(defaultConfig)
}

// Read a proxy txt file & create a ProxyList
async function readProxyFile (file) {
  console.debug(`read proxy file : ${file}`)
  const lines = (await readFile(file)).toString().split('\n')
  const proxyList = new ProxyList()

  proxyList.setProxies(lines.filter(filterProxies).map(line => new Proxy().fromArray(line.split(':'))))

  return proxyList
}

function filterProxies (line) {
  if (line === '' || line.charAt(0) === '#') {
    return false
  }

  const proxyInfo = line.split(':')

  if (proxyInfo.length !== 4 && proxyInfo.length !== 2) {
    console.error(`Incorrect line : ${line}`)

    return false
  }

  return true
}
