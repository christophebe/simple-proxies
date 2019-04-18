const assert = require('assert');
const fileLoader = require('../lib/proxyfileloader');

describe('Test proxies', async () => {
  it('#Default File isEmpty', async () => {
    const proxies = await fileLoader.loadDefaultProxies();

    assert.equal(0, proxies.getNumberOfProxies());
  });

  it('Invalid Format', async () => {
    const config = fileLoader.config().setProxyFile('./test/files/invalidformat.txt');
    const proxies = await fileLoader.loadProxyFile(config);

    assert.equal(0, proxies.getNumberOfProxies());
  });

  it('File Not Exist', async () => {
    try {
      fileLoader.config().setProxyFile('./test/files/xxxx.txt');

      assert.fail();
    } catch (e) {

    }
  });

  it('Correct Format', async () => {
    const config = fileLoader.config()
                      .setProxyFile('./test/files/goodformat.txt')
                      .setRemoveInvalidProxies(false);

    const proxyList = await fileLoader.loadProxyFile(config);

    assert.equal(5, proxyList.getNumberOfProxies());
    assert.equal(5, proxyList.getProxies().length);
    const firstProxy = proxyList.getProxy();

    assert.equal(false, firstProxy.valid);

    const proxy = proxyList.getProxies()[1];

    assert.equal(proxy.userName, 'usertest');
    assert.equal(proxy.password, 'passwordtest');
    assert.equal(proxy.getUrl(), 'http://usertest:passwordtest@myproxydomaine.com:1235');

    const p = proxyList.pick();

    assert(p);
  });
});
