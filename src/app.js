import express from 'express';
import path from 'path';
import routes from './routes';

import './database';

class APP {
  constructor() {
    this.server = express();

    this.middlawares();
    this.routes();
  }

  middlawares() {
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
  }
}

export default new APP().server;
