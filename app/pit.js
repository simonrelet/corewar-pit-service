'use strict';

const fsp = require('fs-promise');
const exec = require('child_process').exec;

const SHIPS_PATH = 'bin/ships/';
const COMMAND = 'java -jar bin/pit.jar';

let ensureTmpDir = () => {
  return fsp.ensureDir(SHIPS_PATH);
};

let randomString = length => {
  let value = Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(
    36, length)));
  return value.toString(36).slice(1);
};

let getRndFiles = () => {
  let path = SHIPS_PATH + randomString(32);
  return {
    s: `${path}.s`,
    log: `${path}.log`
  };
};

let writeShipFile = (ship, files) => {
  return () => {
    return fsp.writeFile(files.s, ship)
      .then(() => Promise.resolve(files));
  };
};

let deleteShipFile = result => {
  let sPromise = fsp.remove(result.files.s);
  let logPromise = fsp.remove(result.files.log);
  return Promise.all([sPromise, logPromise])
    .then(() => Promise.resolve(result.result));
};

let runPit = files => {
  return new Promise((resolve, reject) => {
      exec(`${COMMAND} ${files.s} > ${files.log}`, (err, stdout, stderr) => {
        if (err) {
          reject(`Error while runing the stadium: ${err}`);
        } else if (stderr) {
          reject(`Error while runing the stadium: ${stderr}`);
        } else {
          resolve(files);
        }
      });
    })
    .catch(err => {
      deleteShipFile({
        files: files
      }).catch(console.error);

      return Promise.reject(err);
    });
};

let readLogFile = files => {
  return fsp.readJson(files.log)
    .then(resultObj => {
      return {
        files: files,
        result: resultObj
      };
    });
};

let run = ship => {
  return ensureTmpDir()
    .then(writeShipFile(ship, getRndFiles()))
    .then(runPit)
    .then(readLogFile)
    .then(deleteShipFile);
};

module.exports = {
  run: run
};
