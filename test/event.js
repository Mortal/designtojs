
//Overrides 'this':

myObject.on('explode', function(radius) {
    console.log('An explosion with a radius of ' + radius + '!');
}.bind(this))  

//Doesn't override 'this':

myObject.on('explode', (function(radius) {
    console.log('An explosion with a radius of ' + radius + '!');
}))  

//Another way to write same thing

myObject.on('explode', (function(radius) {
    console.log('An explosion with a radius of ' + radius + '!');
}))  

//Also doesn't override 'this':

function explosionListener(radius) {
    console.log('An explosion with a radius of ' + radius + '!');
}

myObject.on('explode', explosionListener)  
