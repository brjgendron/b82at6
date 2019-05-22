/*!
 * uri.js v0.1.3
 * Copyright (c) 2013 Nathaniel Higgins; Licensed MIT
 * Built on 2013-07-02 
 */
(function(undefined) {

  'use strict';

  var URI = function(opts) {

    // Make sure we haven't been made via new
    if (this instanceof URI) {
      return URI(opts);
    }

    // Set the retval
    var location = {};

    // If we've passed in url or url fragment
    if (typeof opts === 'string') {
      // Right now we only support query strings, so just set opts to reflect that
      opts = { query: opts };
    }

    // If we have a query string
    if ('query' in opts) {
      // Parse the query string and assign it to the location
      location.query = URI.query(opts.query);
      location.search = URI.search(opts.query);
    }

    return location;
  };

  URI.prototype = {

    /**
     * Extract a query string from a url
     * @param  {string} url The url
     * @return {string}     The extracted query string
     */
    search: function(url) {

      // If the URL is an object with toString, do that
      if (typeof url === 'object' && typeof url.toString === 'function') {
        url = url.toString();
      }

      var query_string;

      // If the url does not have a query, return a blank string
      if (url.indexOf('?') === -1 && url.indexOf('=') === -1) {
        query_string = '';
      } else {
        var parts = url.split('?');
        var part = parts.slice(parts.length === 1 ? 0 : 1);
        query_string = '?' + part.join('?').split('#')[0];
      }


      return query_string;
    },

    /**
     * Parse URI query strings
     * @param  {string} url        The URL or query string to parse
     * @param  {bool}   decode     Should values be URI decoded?
     * @return {object}            The parsed query string
     */
    query: function(url, decode) {
      // Default decode to true
      if (typeof decode === 'undefined') decode = true;

      // Extract query string from url
      var query_string = this.search(url);

      // Replace the starting ?, if it is there
      query_string = query_string.replace(/^\?/, '');

      var parts;

      // If query string is blank, parts should be blank
      if (query_string === '') {
        parts = [];
      } else {
        // Split the query string into key value parts
        parts = query_string.split('&');
      }

      // Iniate the return value
      var query = {};

      // Loop through each other the parts, splitting it into keys and values
      for (var i = 0, l = parts.length; i < l; i++) {
        var part = parts[i];
        var key;
        var val = '';

        if (part.match('=')) {
          // If it is in the format key=val
          
          // Split into the key and value by the = symbol
          var part_parts = part.split('=');

          // Assign key and value
          key = part_parts[0];
          val = part_parts[1];
        } else {
          // If there is no value, just set the key to the full part
          key = part;
        }

        // If we actually have a value, URI decode it
        if (val !== '' && decode) {
          val = decodeURIComponent(val);
        }

        // Assign to the return value
        query[key] = val;
      }

      return query;
    },

    /**
     * Deep merge two or more objects
     * @param {boolean} deep Should this be a deep copy or not?
     * @return {object}    Merged version of the arguments
     */
    extend: function() {

      // Not as nice as arguments.callee but at least we'll only have on reference.
      var _this = this;
      var extend = function() { return _this.extend.apply(_this, arguments); };

      // If we don't have enough arguments to do anything, just return an object
      if (arguments.length < 2) {
        return {};
      }

      // Argument shuffling
      if (typeof arguments[0] !== 'boolean') {
        Array.prototype.unshift.call(arguments, true);
      }

      // Remove the variables we need from the arguments stack.
      var deep = Array.prototype.shift.call(arguments);
      var one = Array.prototype.shift.call(arguments);
      var two = Array.prototype.shift.call(arguments);

      // If we have more than two objects to merge
      if (arguments.length > 0) {

        // Push two back on to the arguments stack, it's no longer special.
        Array.prototype.unshift.call(arguments, two);

        // While we have any more arguments, call extend with the initial obj and the next argument
        while (arguments.length > 0) {
          two = Array.prototype.shift.call(arguments);

          if (typeof two !== 'object') continue;

          one = extend(deep, one, two);
        }

        return one;
      }

      // Do some checking to force one and two to be objects
      if (typeof one !== 'object') {
        one = {};
      }

      if (typeof two !== 'object') {
        two = {};
      }

      // Loop through the second object to merge it with the first
      for (var key in two) {
        // If this key actually belongs to the second argument
        if (Object.prototype.hasOwnProperty.call(two, key)) {
          var current = two[key];

          if (deep && typeof current === 'object' && typeof one[key] === 'object') {
            // Deep copy
            one[key] = extend(one[key], current);
          } else {
            one[key] = current;
          }
        }
      }

      return one;
    }
  };

  var wrap = function(func, obj) {
    return function() {
      return func.apply(obj, arguments);
    };
  };

  // Clone from prototype to function
  for (var k in URI.prototype) {
    if (Object.prototype.hasOwnProperty.call(URI.prototype, k)) {
      URI[k] = wrap(URI.prototype[k], URI);
    }
  }

  if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    // CommonJS, Node, PhantomJS, etc modules
    module.exports = exports = URI;
  } else if (typeof define !== 'undefined') {
    // RequireJS Module
    define(function(require, exports, module) {
      module.exports = exports = URI;
    });
  } else if (typeof window !== 'undefined' && typeof uriCallback === 'undefined') {
    // Being included directly in the browser
    window.URI = URI;
    
    var location = window.location;
    var defaults = {
      auto: {
        query: false
      },

      keys: {
        query: 'query'
      }
    };

    if (!location.query_opts) {
      location.query_opts = {};
    }

    var opts = URI.extend({}, defaults, location.query_opts);
    delete location.query_opts;

    if (opts.auto || (typeof opts.auto === 'object' && opts.auto.query)) {
      location[opts.keys.query] = URI.query(location.search);
    }
  } else if (typeof uriCallback === 'function') {
    // Last resort, pass URI into a callback
    uriCallback(URI);
  }
})();