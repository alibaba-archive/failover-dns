failover-dns
=======

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/failover-dns.svg?style=flat-square
[npm-url]: https://npmjs.org/package/failover-dns
[travis-image]: https://img.shields.io/travis/node-modules/failover-dns.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/failover-dns
[codecov-image]: https://codecov.io/github/node-modules/failover-dns/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/node-modules/failover-dns?branch=master
[david-image]: https://img.shields.io/david/node-modules/failover-dns.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/failover-dns
[snyk-image]: https://snyk.io/test/npm/failover-dns/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/failover-dns
[download-image]: https://img.shields.io/npm/dm/failover-dns.svg?style=flat-square
[download-url]: https://npmjs.org/package/failover-dns

Use local cache dns query result when dns query fail.

- Support dns lookup with `options.timeout`.

## Installation

```bash
$ npm install failover-dns
```

## Quick start

```js
const dns = require('failover-dns');

// must listen `error` event to logging by yourself
dns.on('error', err => console.error(err));

dns.lookup('cnpmjs.org', { family: 4, timeout: 2000 }, (err, ip, family) => {
  if (err) throw err;
  console.log(ip, family);
});
```

## License

[MIT](LICENSE)
