import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';

import router from './router';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const securePort = process.env.SECURE_PORT || 3003;

const options = {
  key: fs.readFileSync(process.env.KEY || './keys/local.key'),
  cert: fs.readFileSync(process.env.CERT || './keys/local.crt'),
};

app.use('/', router);

http.createServer(app).listen(port, () => console.log(`server runs on port ${port}`));
https
  .createServer(options, app)
  .listen(securePort, () => console.log(`secure server runs on port ${securePort}`));
