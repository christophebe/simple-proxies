var bunyan = require('bunyan');


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
