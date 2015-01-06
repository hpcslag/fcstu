var jsesc = require('jsesc');

exports.decode = function(str){
    str = str.replace(/\\u([\d\w]{4})/gi, function (match, grp) {
        return String.fromCharCode(parseInt(grp, 16)); 
    });
    str = unescape(str);
    return str;
}
exports.encode = function(str){
    return jsesc(str);
}