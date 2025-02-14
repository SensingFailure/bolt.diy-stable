import { createRequestHandler } from '@remix-run/express';
import express from 'express';
import * as build from './build/server/entry.server.js';
import { installGlobals } from '@remix-run/node';

installGlobals();

const app = express();
const port = process.env.PORT || 5173;

// Serve static files
app.use(express.static('public'));
app.use(express.static('build/client'));

// Handle all other routes with Remix
app.all('*', createRequestHandler({ build }));

app.listen(port, '0.0.0.0', () => {
  console.log(`Express server listening on port ${port}`);
});
