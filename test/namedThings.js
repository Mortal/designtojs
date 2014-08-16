
namedLoop: while(true){
    break namedLoop;
}

function test(lel){
    namedLoop: for(var i=0; i<lel; i++){
        console.log(i, lel);
    }
}

test();
