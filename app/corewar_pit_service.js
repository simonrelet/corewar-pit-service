'use strict';

const app = require('express')();

app.use('/', require('./routers/pit-router.js'));

let server = app.listen(4201, () => {
  console.log(`Listening on port ${server.address().port}`);
});
