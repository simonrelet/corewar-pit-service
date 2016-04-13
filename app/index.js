'use strict';

const app = require('express')();
const constants = require('./constants');

app.use('/', require('./routers/pit-router.js'));

let server = app.listen(constants.config.port, () => {
  console.log(`Listening on port ${server.address().port}`);
});
