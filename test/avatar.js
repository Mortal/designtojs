
function saveUserAvatar(path, username, callback) {if(path===null||path===undefined){path= 'default.png';}
    fs.readFile(path, function(error, buffer){if(error!==null&&error!==undefined){return  callback(error);}
    db.saveAvatar(username, buffer, function(error){if(error!==null&&error!==undefined){return  callback(error);}
    console.log("avatar written!");
    callback();
}.bind(this));  }.bind(this));  }
saveUserAvatar('pic.png', 'lain', function(error){
// do something
}.bind(this));  