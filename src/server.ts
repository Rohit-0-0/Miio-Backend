import http from 'node:http';

import app from './app.js';

const server = http.createServer(app);

export default server;
