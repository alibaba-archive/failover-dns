'use strict';

const assert = require('power-assert');
const mm = require('mm');
const pedding = require('pedding');
const dns = require('../');

describe('test/failover-dns.test.js', () => {
  afterEach(mm.restore);

  it('should lookup without options from dns server', done => {
    dns.lookup('a.alipayobjects.com', (err, ip, family) => {
      console.log(err, ip, family);
      assert(err == null);
      assert((/^\d+\.\d+\.\d+\.\d+$/).test(ip));
      assert(family === 4);
      done();
    });
  });

  it('should lookup with options.family from dns server', done => {
    dns.lookup('cnpmjs.org', { family: 4 }, (err, ip, family) => {
      console.log(err, ip, family);
      assert(err == null);
      assert((/^\d+\.\d+\.\d+\.\d+$/).test(ip));
      assert(family === 4);

      // lookup again should not change
      dns.lookup('cnpmjs.org', { family: 4 }, (err, ip2, family) => {
        console.log(err, ip2, family);
        assert(err == null);
        assert(ip2 === ip);
        assert(family === 4);
        done();
      });
    });
  });

  it('should mock ip change then update cache', done => {
    mm(require('dns'), 'lookup', (hostname, options, callback) => {
      callback(null, '10.0.1.1', 4);
    });
    dns.lookup('a.alipayobjects.com', { family: 4 }, (err, ip, family) => {
      console.log(err, ip, family);
      assert(err == null);
      assert(ip === '10.0.1.1');
      assert(family === 4);
      done();
    });
  });

  it('should mock error then return address from local cache', done => {
    done = pedding(2, done);
    mm.error(require('dns'), 'lookup', 'mock dns lookup error');

    dns.once('error', err => {
      assert(err.message === 'mock dns lookup error');
      done();
    });
    dns.lookup('a.alipayobjects.com', { family: 4 }, (err, ip, family) => {
      console.log(err, ip, family);
      assert(err == null);
      assert((/^\d+\.\d+\.\d+\.\d+$/).test(ip));
      assert(family === 4);
      done();
    });
  });

  it('should lookup with options.all from dns server', done => {
    dns.lookup('a.alipayobjects.com', { all: true }, (err, ips) => {
      console.log(err, ips);
      assert(err == null);
      assert((/^\d+\.\d+\.\d+\.\d+$/).test(ips[0].address));
      assert(ips[0].family === 4);
      done();
    });
  });

  it('should lookup with options.family = 6 throw getaddrinfo ENOTFOUND', done => {
    dns.lookup('cnpmjs.org', { family: 6 }, (err, ip, family) => {
      console.log(err, ip, family);
      assert(err);
      done();
    });
  });
});
