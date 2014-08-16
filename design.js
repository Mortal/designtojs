
var compile = require('./lib/compile.js');

compile.compileFile(process.argv[2], function(error, output){
    console.log(output); 
});
