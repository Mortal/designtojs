
Design.js
=========

An extension of JavaScript that makes designing objects and classes easier
as well as providing a neat way to deal with callback hell.

Example: A class returning and formatting the current date (with callbacks ;^))

```js
MyDate: (pre: 'Time') {
    this.pre = pre;
    console.log('Time object created, using prefix ' + this.pre);
};

MyDate.currentTime: (add: 0, callback) {
    callback(null, Date.now() + add);
};

//Using a question mark behind and argument will make that argument optional
MyDate.formatTime: (add?, callback) {
    this.currentTime(add) -> (error!callback, timestamp)
    callback(null, this.pre + ': ' + timestamp);
};

var date = new MyDate('Test');

date.currentTime(0) -> (error, time)
console.log(time);

date.formatTime(10) -> (error, text)
console.log(text);
```

This example translates to the following JavaScript (beautified):

```js

function MyDate(pre){
    if(pre === null || typeof pre === 'undefined'){
        pre = 'Time';
    }
    
    this.pre = pre;
    console.log('Time object created, using prefix ' + this.pre);
}

MyDate.prototype.currentTime = function(add, callback){
    if(add === null || typeof add === 'undefined'){
        add = 0;
    }
    callback(null, Date.now() + add);
};

MyDate.prototype.formatTime = function(add, callback){
    if(callback === null || typeof callback === 'undefined'){
        callback = add;
        add = undefined;
    }
    this.currentTime(add, function(error, timestamp){
        if(error !== null && typeof error !== 'undefined') return callback(error);
        callback(this.pre + ': The current UNIX Time is ' + timestamp + ' but ' + add + ' was added to it');
    }.bind(this));
};

var date = new MyDate('Test');

date.currentTime(null, function(error, time){
    console.log(time);
    date.formatTime(10, function(error, text){
        console.log(text);
    }.bind(this));
}.bind(this));

```

(Other) ways to use callbacks:

```js
date.currentTime(0) -> (error!, time) {
    console.log(time);
}

date.formatTime(10) -> (error, text) {
    console.log(text);
}
```

Result: 

```js
date.currentTime(0, function(error, time){
    if(error !== null && typeof error !== 'undefined') return;
    console.log(time);
}.bind(this));

date.formatTime(10, function(error, text){
    console.log(text);    
}.bind(this));
```

Defining ordinary functions: 


```js
doStuff: (name: 'Thomas') {
    console.log('hello '+name);
}
```

Result: 

```js

function doStuff(name) {
    if(name === null || typeof name === 'undefined'){
        ip = '127.0.0.1';
    }
    console.log('hello '+name);
}

```

Multiple callbacks and passing on arguments:
```js
lookupName: (ip: '127.0.0.1', callback) {
    db.getUserID(ip) -> (error! callback, user_id)
    db.getUserName(user_id) -> callback
}

```

It's worth looking at the result of this:

```js
function lookupName(ip, callback) {
    if(ip === null || typeof ip === 'undefined'){
        ip = '127.0.0.1';
    }
    db.getUserID(ip, function(error, user_id){
        if(error !== null && typeof error !== 'undefined'){
            return callback(error);
        }
        db.getUserName(user_id, callback);
    }.bind(this))
}

```

Event Listerners:

```js
myObject.on('explode') -> (radius) {
    console.log('An explosion with a radius of ' + radius + '!');
}
```

Result:

```
myObject.on('explode', function(radius) {
    console.log('An explosion with a radius of ' + radius + '!');
}.bind(this));

```
