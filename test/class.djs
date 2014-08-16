MyDate: (pre: 'Time') {
    this.pre = pre;
};

MyDate.currentTime: (add: 0, callback) {
    callback(null, Date.now() + add);
};

MyDate.formatTime: (add?, callback) {
    this.currentTime(add) -> (error!callback, timestamp)
    callback(null, this.pre + ': ' + timestamp);
};

var date = new MyDate('Callbacks');

date.currentTime(0) -> (error, time) {
    console.log(time);
}

date.formatTime() -> (error, text) {
    console.log(text);
}
