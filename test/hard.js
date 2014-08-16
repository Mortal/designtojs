

// Some complicated test cases

function Albert(add){if(add===null||typeof add==='undefined'){add=2 + Math.add(2,3)/*add the numbers*/}this.add = add}

var test = 3
Albert.nano: test ? function(what, , ){if(herp===null||typeof herp==='undefined'){herp=add;add=what;what=undefined;}if(add===null||typeof add==='undefined'){add=3}if(herp!==null&&typeof herp!=='undefined'){return herp}
    console.log(this.add + add)
} : function(toplel) {
    return;
}

Albert.prototype.nano2 = function(what, add, herp){if(herp===null||typeof herp==='undefined'){herp=add;add=undefined;}
    console.log(what, add, herp);
}

var ulb = new Albert();

ulb.nano(5);
ulb.nano(5, 5); //Shouldn't be printed
ulb.nano(5, 5, 5); //Shouldn't be printed either

ulb.nano2(5, 5); //Should print 5, undefined, 5
