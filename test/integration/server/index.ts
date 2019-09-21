import express from 'express';
import * as path from 'path';

const newApp = () => {
  let app = express();
  app.use(express.static(path.join(__dirname, 'content')));
  return app;
};

export {
  newApp,
};
