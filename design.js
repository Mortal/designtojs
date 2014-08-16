#!/usr/bin/node

var compile = require('./lib/compile.js');
var fs = require('fs');

var input = process.argv.slice(2);

if(input.indexOf('-h') !== -1 || input.indexOf('--help') !== -1){
    console.log("Usage: designtojs [inputfile, ...] [-o outputfolder]");
    console.log("Prints to stdout by default");
    return;
}

var outI = input.indexOf('-o');
var outFolder;

if(outI !== -1){
    outFolder = input[outI+1];
    input.splice(outI, 2);
}

var pairs = [];
for(var i=0; i<input.length; i++){
    var file = input[i];
    var basename = file.slice(0, file.lastIndexOf('.'));
    if(outFolder){
        var output = outFolder+'/'+basename+'.js';
        var dir = output.slice(0, output.lastIndexOf('/'));
    }
    pairs.push({
        input: file,
        output: output,
        dir: dir
    });
}

for(var i=0; i<pairs.length; i++){
    var pair = pairs[i];

    var content = fs.readFileSync(pair.input);
    var compiled = compile.compileString(content);
    if(pair.output){
        try {
            fs.mkdirSync(pair.dir);
        } catch (e){}
        fs.writeFileSync(pair.output, compiled);
    } else {
        process.stdout.write(compiled); 
    }
}
