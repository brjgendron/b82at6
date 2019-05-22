# Changelog

## Version 0.1.3

 - Build testing
 - @nathggns: Rename `URI.extract_query` to `URI.search` (Fixes #4) 64271e0f6ab147ec6d0a41d7a471c801bba681f9
 - @nathggns: Stop the failure that occures when parsing a full URL that has no query (Fixes #3) ef2ba15e4fdd966ed56bbe01b287d42f8de6ab6c and 5f078cf4c894912aef52b9109c08b4f63ccb33cf
 - @nathggns: Make `URI.search` work with objects that have a toString method (Fixes #2) db6a89819b0a0c9092f5866e0a402cace935e155

## Version 0.1.2

 - README updates.
 - More browser support
 - Always run tests in build process
 - Add `uriCallback` method of getting `URI`
 - Passing full URLs to URI.query
 - Getting Location-like objects by simply calling `URI`. 
 - Add a search parameter to the Location-like object.

## Version 0.1.1

 - Documentation Updates

## Version 0.1.0

 - Initial version