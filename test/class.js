
function MyDate(pre) {if(pre===null||typeof pre==='undefined'){pre= 'Time'}
    this.pre = pre;
};

MyDate.prototype.currentTime = function(add, callback) {if(add===null||typeof add==='undefined'){add= 0}
    callback(null, Date.now() + add);
};

MyDate.prototype.formatTime = function(add, callback) {if(callback===null||typeof callback==='undefined'){callback=add;add=undefined;}
    this.currentTime(add, function(error, timestamp){if(error!==null&&typeof error!=='undefined'){return callback(error)}
    callback(null, this.pre + ': ' + timestamp);
}.bind(this))  };

var date = new MyDate('Callbacks');

date.currentTime(0, function(error, time) {
    console.log(time);
}.bind(this))  

date.formatTime(function(error, text) {
    console.log(text);
}.bind(this))  
