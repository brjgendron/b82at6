var URI = require('../src/uri.js');
var should = require('should');

describe('URI', function() {


  describe('query', function() {

    it('should have query method', function() {
      URI.should.have.property('query');
    });

    it('should parse key=val', function() {
      var parsed = URI.query('?a=b');
      parsed.should.eql({ a: 'b' })
    });

    it('should parse key', function() {
      var parsed = URI.query('?a');
      parsed.should.eql({ a: '' })
    });

    it('should parse key and key=val', function() {
      var parsed = URI.query('?a&b=c');
      parsed.should.eql({ a: '', b: 'c' })
    });

    it('should be decode values', function() {
      var parsed = URI.query('?a=%3Fa%3Db');
      parsed.should.eql({ a: '?a=b'});
    });

    it('should be able to disable decoding values', function() {
      var parsed = URI.query('?a=%3Fa%3Db', false);
      parsed.should.eql({ a: '%3Fa%3Db'});
    });

    it('should work with full uris', function() {
      var parsed = URI.query('https://user:pw@example.com:80/a/b?c=d#e');

      parsed.should.eql({ c: 'd' });
    });
    
  });

});