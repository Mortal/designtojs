

// Some complicated test cases

Albert: (add:2 + Math.add(2,3)/*add the numbers*/){this.add = add}

var test = 3
Albert.nano: test ? (what?, add:3, herp!){
    console.log(this.add + add)
} : (toplel) {
    return;
}

Albert.nano2: (what, add?, herp){
    console.log(what, add, herp);
}

var ulb = new Albert();

ulb.nano(5);
ulb.nano(5, 5); //Shouldn't be printed
ulb.nano(5, 5, 5); //Shouldn't be printed either

ulb.nano2(5, 5); //Should print 5, undefined, 5
