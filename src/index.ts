import cors, { CorsOptions } from 'cors';
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

const secureServerOptions = {
  key: fs.readFileSync(process.env.KEY || './keys/local.key', 'utf8'),
  cert: fs.readFileSync(process.env.CERT || './keys/local.crt', 'utf8'),
};

const whitelist = ['http://semenyuk.eu', 'https://semenyuk.eu', 'http://localhost'];
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    console.log(origin);
    callback(null, true);
    // FIXME: enable whitelist for CORS
    /*if (!origin) {
      callback(new Error('Not allowed by CORS'));
    }

    if (whitelist.indexOf(origin as string) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }*/
  },
};

app.use(cors(corsOptions));
app.use('/', router);

http.createServer(app).listen(port, () => console.log(`server runs on port ${port}`));
https
  .createServer(secureServerOptions, app)
  .listen(securePort, () => console.log(`secure server runs on port ${securePort}`));
