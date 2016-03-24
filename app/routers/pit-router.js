'use strict';

const pit = require('../pit');
const router = require('./default_router')();

const STATUS_BAD_REQUEST = 400;
const STATUS_SERVER_ERROR = 500;

let checkRequest = req => {
  if (req.body.ship) {
    return Promise.resolve(req.body.ship);
  } else {
    return Promise.reject({
      status: STATUS_BAD_REQUEST,
      message: `Where's the ship dude?`
    });
  }
};

let getOptions = req => {
  return {
    pretty: !!req.query.pretty
  };
};

let runPit = options => {
  return ship => {
    return pit.run(ship).catch(err => Promise.reject({
      status: STATUS_SERVER_ERROR,
      message: err.message || err
    }));
  };
};

let prettyPrint = (prefix, logs) => {
  return logs.map(log => `${prefix} line ${log.line}: ${log.message}`)
    .reduce((prev, line) => `${prev}\n${line}`);
};

let prettyPrintResults = (res, result) => {
  let out = '';
  if (result.value) {
    out = `Your ship is ready to kick asses!\n\nship: ${result.value}\n`;
  } else {
    out = `Go fix your ship!\n${prettyPrint('Error', result.errors)}\n`;
  }
  if (result.warnings) {
    out += `${prettyPrint('Warning', result.warnings)}\n`;
  }
  res.send(out);
};

let sendResult = (res, options) => {
  return result => {
    if (options.pretty) {
      prettyPrintResults(res, result);
    } else {
      res.json(result);
    }
  };
};

let handleError = (res, options) => {
  return err => {
    if (options.pretty) {
      res.status(err.status).send(err.message);
    } else {
      res.status(err.status).json({
        error: {
          message: err.message
        }
      });
    }
  };
};

router.post('/', (req, res) => {
  let options = getOptions(req);
  checkRequest(req)
    .then(runPit(options))
    .then(sendResult(res, options))
    .catch(handleError(res, options));
});

module.exports = router;
