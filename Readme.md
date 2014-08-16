
DesignToJs
==========

A small but powerful extension of JS with a compiler written in JS.

Example:

```js

sayHello: (name: 'Tim', age?, city) {
    console.log('Hello to ' + city + ', ' + name);
    if(age){
        console.log('It\'s nice to be '+age+' years old');
    } else {
        console.log('You didn\'t tell me your age');
    }
}

```

This compiled to the following JavaScript:

```js
function sayHello(name, age, city) {
    if(city === 'null' || typeof city === 'undefined'){
        city = age;
        age = undefined;
    }
    if(name === 'null' || typeof name === 'undefined'){
        name = 'Tim';
    }
    console.log('Hello to ' + city + ', ' + name);
    if(age){
        console.log('It\'s nice to be '+age+' years old');
    } else {
        console.log('You didn\'t tell me your age');
    }
}

```
*The code has been beautified. DesignToJS will fit everything into one live by default, leaving all your line-numbers intact! No sourcemap necesssary.* 

The example above shows DesignToJS function syntax as well as some useful argument handling,
but it's far from being everything that can be done with it.

Have a look at this function, which reads and prints an imaginary file in node.js:

```js
printFile: (path) {
    fs.readFile(path) -> (error!, contents)
    console.log(contents);
}

```

This results in the following code:

```js
function printFile(path){
    fs.readFile(path, function(error, contents){
        if(error !== null && typeof error !== 'undefined') return;
        console.log(contents);
    });
}
```

Isn't that a nice way to do concurrency? 
Of course sometimes you don't want to wrap the entire remaining function in a callback,
or even pass the error to a callback. Let's look at some more advanced example:

```js
printFile: (path, callback) {
    fs.readFile(path) -> (error!callback, contents) {
        console.log(contents);
        callback();
    }
    console.log('Reading file...');
}

```

Which gives us the following code:

```js
function printFile(path, callback){
    fs.readFile(path, function(error, contents){
        if(error !== null && typeof error !== 'undefined') return callback(error);
        console.log(contents);
        callback();
    }.bind(this));
    console.log('Reading file...');
}
```

Now isn't this awesome?
Also note how DesignToJS automatically binds 'this' to the function.
This can be prevented by either wrapping the function in brackets,
passing a variable, or anything but a simple function.

DesignToJs can create JavaScript classes too:

```js
Car: (color: 'red'){
    this.color = color;
}

Car.drive: (what: 'highway'){
    console.log('A car of '+ this.color +' is driving along the'+ what )
}
```

And this gives us:

```js
function Car(color){
    if(color === null || typeof color === 'undefined'){
        color = red;
    }
    this.color = color;
}

Car.prototype.drive = function(what){
    if(color === null || typeof color === 'undefined'){
        color = red;
    }
    console.log('A car of '+ this.color +' is driving along the'+ what )
}
```

Documentation
-------------



Tools
-----

The tools folder contains some help with integrating DesignToJs with your everyday tools.
