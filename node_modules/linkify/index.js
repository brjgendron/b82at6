var MAGIC_REGEX = (function() {
  return new RegExp(require('fs')
                    .readFileSync(__dirname+'/magic-regex.txt', 'utf8')
                    .split('\n')
                    .map(function(line) {
                      return line.split('#')[0].trim()
                    })
                    .join('')
                   ,
                    'gi'
                   )
})()

function replaceURLs(text, fn) {
  if (typeof fn === 'string') {
    if (fn === 'html')
      fn = function(match, url) {
        url = url.replace(/"/g, '&quot;')
        return '<a href="'+url+'">'+match+'</a>'
      }
    else if (fn === 'latex')
      fn = function(match, url) {
        url = url.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
        return '\\href{'+url+'}{'+match+'}'
      }
    else
      throw new Error('unknown replacer type')
  }
  return text.replace(MAGIC_REGEX, function(match) {
    var matchURL = match
    if (!/^[a-zA-Z]{1,6}:/.test(matchURL)) matchURL = 'http://' + matchURL
    return fn(match, matchURL)
  })
}

module.exports = replaceURLs
