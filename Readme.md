
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

```
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
*The code has been beautified. DesignToJS will fit everything into one line by default, leaving all your line-numbers intact! No sourcemap necesssary.* 

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

```
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
    fs.readFile(path) -> (error! callback, contents) {
        console.log(contents);
        callback();
    }
    console.log('Reading file...');
}

```

Which gives us the following code:

```
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

```
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
=============

Functions
---------

A function is created with the following syntax:

```
[Name:] ([arg1, arg2, ...]) {

}
```
*Name*: The name to use for the function. Omitting it will create an anonymous function.
*Brackets*: The '{' and '}' brackets around the function body are optional when using 
the callback syntax (See next). When omitting them, the entire remaining body of the current
context will be used.

Callbacks
---------

The '->' callback operator appends the right-side argument as last the last argument to the left-side function call.

```
asyncFunction([arg1, arg2, ...]) -> variable | function
```

Example using an anonymous function:

```
asyncFunction(arg1, arg2) -> (error, arg1, arg2) {
}
```

Example using a variable
```
asyncFunction(arg1, arg2) -> callback
```

### Binding:

If the right-side argument is an anonymous function, it will be bound to the current 'this'
contect *unless* it is wrapped in brackets, example:

```
//Not bound:
asyncFunction(arg1, arg2) -> ((error, arg1, arg2) {

})
```

Function Arguments
------------------

DesignToJS adds some useful operators that can be used on function arguments.

### 'Default' Operator: 

Allows you to define a default value for an argument.

Syntax:
```
arg: [default]
```
*default*: If arg is either undefined or null, it will be set to the value given as 'default'

### 'Should not' Operator: 

If the argument is not null or undefined, the function will return immediatly and call the given callback function with the argument.

Syntax:
```
arg! [callback]
```
*callback*: If given, this function will be called with the value of the argument.

### 'Optional' Operator:

Makes the marked element optional. A function can only have one optional operator.
If the rightmost function argument is undefined or null, all other function arguments will be shifted so only the optional argument remains undefined.

Syntax:
```
arg?
```

Example:

```
example(arg1, arg2?, arg3, arg4){
}
```
If arg4 would be empty, arg4 would be set to arg3, arg3 to arg2 and arg2 to undefined.

Tools
=====

The tools folder contains some help with integrating DesignToJs with your everyday tools.

DesignToJs should work fine with most common JavaScript Syntax highliters.
