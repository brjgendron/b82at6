var URI = require('../src/uri.js');
var should = require('should');

describe('URI', function() {

  describe('search', function() {

    it('should work with full urls', function() {
      var query = URI.search('https://user:pw@example.com:80/a/b?c=d&e=f&g#e');

      query.should.eql('?c=d&e=f&g');
    });

    it('should work when passing in objects that use toString', function() {

      var f = function(string) {
        this.string = string;
      };

      f.prototype.toString = function() {
        return '?' + this.string;
      };

      var random = Math.floor(Math.random() * 100000).toString();
      var obj = new f(random);

      var query = URI.search(obj);

      query.should.eql(obj.toString());
    });
  });

});