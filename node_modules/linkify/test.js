var linkify = require('./index.js'),
    assert = require('assert');
assert.equal(linkify("Google homepage is at http://google.com", "latex"),
    "Google homepage is at \\href{http://google.com}{http://google.com}");