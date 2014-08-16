
var compile = require('./lib/compile.js');
var fs = require('fs');

compile.compileFile(process.argv[2], function(error, output){
    if(!process.argv[3]){
        process.stdout.write(output); 
    } else {
        fs.writeFileSync(process.argv[3], output); 
    }
});
