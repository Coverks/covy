let fs = require('fs');
let config;

if (fs.existsSync('./config.json')) {
  config = require('./config.json');
} else {
  config = {
  };
}

module.exports = config;
