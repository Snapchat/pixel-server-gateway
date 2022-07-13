import http from 'http';

import { assets } from './assets';
import { config } from './config';
import { log, logError } from './helpers/log';
import { partialURL } from './helpers/partial-url';
import { IncomingRequest } from './incoming-request';
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
    let url = partialURL(req.url);
    if (url) {
      if (req.method === 'GET' && url.pathname === '/') {
        new RootDocRequest(req, res);
        return;
      }
      if (req.method === 'GET' && (url.pathname === '/scevent.min.js' || url.pathname === '/s.js')) {
        new JSAssetRequest(req, res);
        return;
      }
      if (url.pathname === '/r' || url.pathname === '/conversion' || url.pathname === '/v2/conversion') {
        const attachRelayInfo = (url.pathname === '/r');
        if (req.method === 'OPTIONS') {
          new CORSRequest(req, res);
          return;
        }
        if (IncomingRequest.acceptedMethods.includes(req.method || '')) {
          new RelayRequest(req, res, body, url, attachRelayInfo);
          return;
        }
      }
    }
    new NotFound(req, res);
  }
}

/**
 * Server singleton
 */
new Server();
