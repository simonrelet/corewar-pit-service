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
    return pit.run(ship, options)
      .catch(err => Promise.reject({
        status: STATUS_SERVER_ERROR,
        message: err.message || err
      }));
  };
};

let sendResult = (res, options) => {
  return result => {
    if (options.pretty) {
      res.send(result);
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
