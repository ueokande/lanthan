'use strict';

const express = require('express');
const path = require('path');

const newApp = () => {
  let app = express();
  app.use(express.static(path.join(__dirname, 'content')));
  return app;
};

module.exports = {
  newApp,
};
