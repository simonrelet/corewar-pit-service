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

let getOptions = opts => {
  if (!opts.pretty) {
    return '-j';
  }
  return '';
};

let runPit = options => {
  return files => {
    return new Promise((resolve, reject) => {
        exec(`${COMMAND} ${options} ${files.s} > ${files.log}`, (err, stdout, stderr) => {
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
};

let readLogFile = options => {
  return files => {
    let p;
    if (options.pretty) {
      p = fsp.readFile(files.log, {
        encoding: 'utf8'
      });
    } else {
      p = fsp.readJson(files.log);
    }
    return p.then(result => {
      return {
        files: files,
        result: result
      };
    });
  };
};

let run = (ship, options) => {
  options = options || {
    pretty: false
  };
  return ensureTmpDir()
    .then(writeShipFile(ship, getRndFiles()))
    .then(runPit(getOptions(options)))
    .then(readLogFile(options))
    .then(deleteShipFile);
};

module.exports = {
  run: run
};
