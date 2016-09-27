'use strict';

const dns = require('dns');
const EventEmitter = require('events');

const DNS_LOOKUP_CACHE = {};

module.exports = exports = new EventEmitter();

exports.DNS_LOOKUP_CACHE = DNS_LOOKUP_CACHE;

// you can set global timeout, default is 0
exports.defaultTimeout = 0;

exports.lookup = function lookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};
  options.timeout = options.timeout || exports.defaultTimeout;

  // don't failover on `options.all = true`
  if (options.all) {
    return dns.lookup(hostname, options, callback);
  }

  const cacheKey = `${hostname}_${options.family}_${options.hints}`;
  exports._lookupWithTimeout(hostname, options, (err, ip, family) => {
    if (err) {
      if (err.name === 'Error') {
        err.name = 'DNSLookupError';
      }
      const address = DNS_LOOKUP_CACHE[cacheKey];
      if (address) {
        // emit error event for logging
        err.hostname = hostname;
        err.options = options;
        err.cacheAddress = address;
        exports.emit('error', err);
        // use cache address
        ip = address.ip;
        family = address.family;
      } else {
        err.options = options;
        return callback(err, ip, family);
      }
    } else {
      // update cache
      const address = DNS_LOOKUP_CACHE[cacheKey];
      if (!address || address.ip !== ip) {
        DNS_LOOKUP_CACHE[cacheKey] = {
          ip,
          family,
        };
      }
    }
    callback(null, ip, family);
  });
};

exports._lookupWithTimeout = function lookupWithTimeout(hostname, options, callback) {
  if (!options.timeout) {
    return dns.lookup(hostname, options, callback);
  }

  let timer = setTimeout(() => {
    timer = null;
    const cb = callback;
    callback = null;
    const err = new Error(`getaddrinfo TIMEOUT ${hostname}`);
    err.name = 'DNSLookupTimeoutError';
    err.options = options;
    err.code = 'TIMEOUT';
    cb(err);
  }, options.timeout);

  dns.lookup(hostname, options, (err, ip, family) => {
    timer && clearTimeout(timer);
    if (!callback) {
      return;
    }
    callback(err, ip, family);
  });
};
