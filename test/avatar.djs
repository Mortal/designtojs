
saveUserAvatar: (path: 'default.png', username, callback) {
    fs.readFile(path) -> (error! callback, buffer)
    db.saveAvatar(username, buffer) -> (error! callback)
    console.log("avatar written!");
    callback();
}
saveUserAvatar('pic.png', 'lain') -> (error)
// do something
