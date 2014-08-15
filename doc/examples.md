
Design.js
=========

An extension of JavaScript that makes designing objects and classes easier
as well as providing a neat way to deal with callback hell.

Example: An Class Returning and formatting the current Date (with callbacks)

```
MyDate: (pre: 'Time') {
    this.pre = pre;
    console.log('Time object created, using prefix ' + this.pre);
};

MyDate.currentTime: (add: 0, callback) {
    callback(null, Date.now() + add);
};

//Using a question mark behind and argument will make that argument optional
MyDate.formatTime: (add?, callback) {
    this.currentTime(add) -> (error! callback, timestamp)
    callback(null, this.pre + ': The current UNIX Time is ' + timestamp + ' but ' + add + ' was added to it');
};

var date = new MyDate('Callbacks');

date.currentTime(0) -> (time)
console.log(time);

date.formatTime(10) -> (text)
console.log(text);
```

This example translates to the following JavaScript: 

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
    });
};

var date = new MyDate('Test');

date.currentTime(null, function(time){
    console.log(time);
    date.formatTime(10, function(text){
        console.log(text);
    });
});

```

(Other) ways to use callbacks:

```
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
});

date.formatTime(10, function(error, text){
    console.log(text);    
});
```

Defining ordinary functions: 


```
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

```

Multiple callbacks and passing on arguments:
```
lookupName: (ip: '127.0.0.1', callback) {
    db.getUserID(ip) -> (error! callback, user_id)
    db.getUserName(user_id) -> callback
}

```

It's worth looking at the result of this:

```
function lookupName(ip, callback) {
    if(ip === null || typeof ip === 'undefined'){
        ip = '127.0.0.1';
    }
    db.getUserID(ip, function(error, user_id){
        if(error !== null && typeof error !== 'undefined'){
            return callback(error);
        }
        db.getUserName(user_id, callback);
    })
}

```

