const fs = require("fs"); 

var bunyan = require('bunyan');

var logFolder = process.cwd() + "/logs" ;

if (! fs.existsSync(logFolder)) {
    fs.mkdirSync(logFolder);
}

console.log("Use log in : " + process.cwd() + '/logs/proxy.log');
var Logger = bunyan.createLogger({
  name: 'full-log',
  streams: [
    {
      type: 'rotating-file',
      period : '1h',
      path: process.cwd() + '/logs/proxy.log'
    }
  ]
});


module.exports.Logger = Logger;
