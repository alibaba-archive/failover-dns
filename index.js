'use strict';

const dns = require('dns');
const EventEmitter = require('events');

const DNS_LOOKUP_CACHE = {};

module.exports = exports = new EventEmitter();

exports.DNS_LOOKUP_CACHE = DNS_LOOKUP_CACHE;

exports.lookup = function lookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (options.all) {
    // don't failover on options.all
    return dns.lookup(hostname, options, callback);
  }

  const cacheKey = `${hostname}_${options.family}_${options.hints}`;
  dns.lookup(hostname, options, (err, ip, family) => {
    if (err) {
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
