var URI = require('../src/uri.js');
var should = require('should');

describe('URI', function() {

  it('should parse the query string passed to it', function() {
    var location = URI('?a=b');

    location.should.have.property('query');
    location.should.have.property('search');

    location.query.should.eql({ a: 'b' });
    location.search.should.eql('?a=b');
  });

  it('should work with full uris', function() {
    var location = URI('https://user:pw@example.com:80/a/b?c=d#e');

    location.should.have.property('query');
    location.should.have.property('search');

    location.query.should.eql({ c: 'd' });
    location.search.should.eql('?c=d');
  });

  it('should work with full uris that have no query', function() {
    var location = URI('https://user:pw@example.com:80/a/b');

    location.should.have.property('query');
    location.should.have.property('search');

    location.query.should.eql({});
    location.search.should.eql('');
  });

});