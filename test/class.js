function MyDate(pre) {if(pre===null||pre===undefined){pre= 'Time';}
    this.pre = pre;
}

MyDate.prototype.currentTime = function(add, callback) {if(add===null||add===undefined){add= 0;}
    callback(null, Date.now() + add);
};

MyDate.prototype.formatTime = function(add, callback) {if(callback===null||callback===undefined){callback=add;add=undefined;}
    this.currentTime(add, function(error, timestamp){if(error!==null&&error!==undefined){return callback(error);}
    callback(null, this.pre + ': ' + timestamp);
}.bind(this));  };

MyDate.staticMethod = function(doSomething){
    //I should probably do something
};

var date = new MyDate('Callbacks');

date.currentTime(0, function(error, time) {
    console.log(time);
}.bind(this));  

date.formatTime(function(error, text) {
    console.log(text);
}.bind(this));  
