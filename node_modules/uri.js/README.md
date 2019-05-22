uri.js
======

URI Parser (and soon to be URI encoder) in Javascript. 

**[Changelog](Changelog.md)**

## Features

 - Parses query strings in Javascript `URI.query` - URL decodes too. 
 - Creates `window.location.query` if included directly as a script and configured to do so.
 - Includes function to extend objects (similar to `jQuery.extend`) `URI.extend`

Supports use as in many module situations (CommonJS, PhantomJS, RequireJS, NodeJS), or simply including as a script in the browser.

## Node Installation

`npm install uri.js`

## Usage

```js
var query = URI.query('?key=val&key2=val2');
// { key: 'val', key2: 'val2' }

// As a RequireJS Module
require(['require', 'uri.js'], function(require, URI) {
    // ..
});

// As a node module
var URI = require('uri.js');

// You can also just pass a full url into URI.query
URI.query('https://user:pw@example.com:80/a/b?c=d#e');
// { c: 'd' }

// You can also just call URI to get a Location-like object. Currently, only supports parsing the query.
URI('https://user:pw@example.com:80/a/b?c=d#e')
// { query: {
//    c: 'd'
// }, search: '?c=d' };
```

### In the browser

`uri.js` can be setup to automatically parse the current page's query string, and assign it to `window.location.query`. This is done using an object assigned to `window.location.query_opts` *(Please let me know if you can think of a better way)*. To set it up to do so, do the following, the `window.location.query_opts` object should look like so.

```js
{
    auto: {
        query: true
    }
}
```

You can also change which key on the `location` object that the parsed query string is assigned to, using the `window.location.query_opts` object. For example, to change the key to `query_string`, you would use the following object.

```js
{
    keys: {
        query: 'query_string'
    }   
}
```

### Last Resort

If for some reason, you're not using `uri.js` in the browser, and you can't use RequireJS or CommonJS, there are two more ways to use `uri.js`. 

The first way, which isn't advised, is to *fake* being in the browser, by setting the `window` variable to an object before including `uri.js` in your script. `uri.js` will then set the `uri` property on this fake `window` variable. You should also set the `location` property on the fake `window` variable to an object, in order to prevent errors with the query string detection.

The recommended way, however, is to set a callback function that will be passed the `URI` object, before including `uri.js`. There can only be one callback, however, and it has to be named `uriCallback`. You would use it like so.

```js
var URI;
var uriCallback = function(uri) {
    URI = uri;
};

// Include uri.js
```
## Contributing

If you would like to contribute to `uri.js`, make sure you follow the standard styleguide in place across `uri.js`, and that every feature you write has been tested for. Do NOT increment `version` in `package.json`, or touch the `dist` folder. Any pull requests on the `master` branch will be rejected, please pull request on the `dev` branch.

**[View Contributing.md for full information](Contributing.md)**

## Tests

`uri.js` uses mocha for its tests. However, we run this via Grunt, which also does some linting for us. `uri.js` is setup so that you can do either of the following to start the test suite - they'll have the same effect.

```
grunt test
// ...

npm test
// ...
```

## Todo

 - Add query string encoding
 - Protocol Parsing
 - Host parsing
 - Port parsing
 - Hash parsing
 - Path parsing
