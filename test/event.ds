
//Overrides 'this':

myObject.on('explode') -> (radius) {
    console.log('An explosion with a radius of ' + radius + '!');
}

//Doesn't override 'this':

myObject.on('explode') -> ((radius) {
    console.log('An explosion with a radius of ' + radius + '!');
})

//Another way to write same thing

myObject.on('explode') -> (function(radius) {
    console.log('An explosion with a radius of ' + radius + '!');
})

//Also doesn't override 'this':

explosionListener: (radius) {
    console.log('An explosion with a radius of ' + radius + '!');
}

myObject.on('explode') -> explosionListener
