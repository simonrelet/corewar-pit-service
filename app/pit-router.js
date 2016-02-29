'use strict';

var router = require('express').Router();
var bodyParser = require('body-parser');
var fsp = require('fs-promise');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec;

var shipsPath = 'bin/ships/';
var pitCmd = 'java -jar bin/pit.jar ';

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: true
}));

router.all('/', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

function ensureTmpDir() {
  return new Promise(function (resolve, reject) {
    mkdirp(shipsPath, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }).catch(function (err) {
    console.log('The directory \'' + shipsPath + '\' could not be created: ' + err);
  });
}

function randomString(length) {
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

function writeShipFile(content) {
  var path = shipsPath + randomString(32) + '.s';
  return fsp.writeFile(path, content).then(function () {
    return Promise.resolve(path);
  }).catch(function (err) {
    console.log('Could not write file: \'' + path + '\': ' + err);
  });
}

function runPit(path) {
  return new Promise(function (resolve, reject) {
    exec(pitCmd + path, function (err, stdout, stderr) {
      if (err) {
        reject(err);
      } else if (stderr) {
        reject(stderr);
      } else {
        console.log('Out: \'' + stdout + '\'');
        resolve({
          path: path,
          res: JSON.parse(stdout)
        });
      }
    });
  }).catch(function (err) {
    console.log('Error while runing pit: ' + err);
  });
}

function deleteShipFile(res) {
  return fsp.unlink(res.path)
    .then(function () {
      return Promise.resolve(res.res);
    }).catch(function (err) {
      console.log('Could not delete file: \'' + res.path + '\': ' + err);
    });
}

router.post('/', function (req, res) {
  ensureTmpDir().then(function () {
    if (!req.body.src) {
      console.log('The request doesn\'t contain a \'src\' attribute');
      res.json({
        errors: [{
          line: 0,
          msg: 'The request doesn\'t contain a \'src\' attribute'
        }]
      });
    } else {
      writeShipFile(req.body.src)
        .then(runPit)
        .then(deleteShipFile)
        .then(function (r) {
          res.json(r);
        });
    }
  });
});

module.exports = router;