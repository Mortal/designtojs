
var compile = require('./lib/compile.js');

compile.compileFile('./test/class.ds', function(error, output){
    console.log(output);
});
