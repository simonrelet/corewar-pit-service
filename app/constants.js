'use strict';

const config = require('./config.json');
const defaultConfig = {
  port: 4201,
  bin: 'pit.jar'
};

module.exports = {
  config: Object.assign(defaultConfig, config)
};
