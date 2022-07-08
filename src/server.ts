import http from 'http';

import { assets } from './assets';
import { config } from './config';
import { log, logError } from './helpers/log';
import { CORSRequest } from './routes/cors';
import { JSAssetRequest } from './routes/js-asset';
import { NotFound } from './routes/not-found';
import { RelayRequest } from './routes/relay';
import { RootDocRequest } from './routes/root-doc';

/**
 * Open interface, listen for connections, route incoming requests
 */
export class Server {
  /**
   * http server object
   */
  protected server: http.Server | undefined;

  /**
   * Initialize server
   */
  constructor() {
    this.boot();
  }

  /**
   * Boot sequence: load assets, open server
   */
  private async boot(): Promise<void> {
    // load assets before opening the server
    await assets.js();
    await assets.rootDoc();
    this.server = http.createServer((req, res) => this.incoming(req, res));
    this.server.listen(config.serverPort, config.serverHost, () => {
      log(`[server] listening on ${config.serverHost}:${config.serverPort}`);
    });
    this.server.on('error', (err) => {
      logError(`[server]`, err);
    });
  }

  /**
   * Incoming request handler. Collects the full request including body, passes on to routing
   * @param req incoming message object
   * @param res server response object
   */
  private incoming(req: http.IncomingMessage, res: http.ServerResponse): void {
    let body = '';
    req.on('data', (chunk) => {
      body += String(chunk);
    });
    req.on('end', () => {
      this.route(req, res, body);
    });
  }

  /**
   * Route request or respond with 404
   * Each "route" is an extension of IncomingRequest class.
   * @param req incoming message object
   * @param res server response object
   * @param body request body
   */
  private route(req: http.IncomingMessage, res: http.ServerResponse, body: string = ''): void {
    const urlParts = String(req.url).split('/');
    if (req.method === 'GET' && req.url === '/') {
      new RootDocRequest(req, res);
      return;
    }
    const part1 = (urlParts[1] || '').split('?')[0];
    if (req.method === 'GET' && (part1 === 'scevent.min.js' || part1 === 's.js') && urlParts.length === 2) {
      new JSAssetRequest(req, res);
      return;
    }
    if (req.method === 'OPTIONS' && part1 === 'r' && urlParts.length === 2) {
      new CORSRequest(req, res);
      return;
    }
    if (req.method === 'POST' && part1 === 'r' && urlParts.length === 2) {
      new RelayRequest(req, res, body);
      return;
    }
    new NotFound(req, res);
  }
}

/**
 * Server singleton
 */
new Server();
