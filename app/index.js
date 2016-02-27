'use strict';

var app = require('express')();

app.use('/', require('./pit-router.js'));

var server = app.listen(4201, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Pit service listening at http://%s:%s', host, port);
});
