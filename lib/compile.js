
var Parser = require('./parser.js');
var Output = require('./output.js');

var fs = require('fs');


module.exports.compileString = function(text){
    text = text.toString();
    var parsed = new Parser(text).parse();
    var output = new Output(parsed).compile();
    return output;
};

module.exports.compileFile = function(path, callback){
    fs.readFile(path, function(error, content){
        if(error) return callback(error);
        callback(null, module.exports.compileString(content));
    });
};
