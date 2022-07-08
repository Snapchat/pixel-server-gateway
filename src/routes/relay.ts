import { createHash } from 'crypto';
import http from 'http';
import https from 'https';
import { IncomingRequest } from '../incoming-request';
import { config } from '../config';
import { debug, logError } from '../helpers/log';

/**
 * Schema for incoming request
 */
interface RelayRequestSchema {
  /**
   * relay path (on host from config.pixelUrl)
   */
  p?: string,

  /**
   * relay HTTP method (e.g. POST)
   */
  m?: string,

  /**
   * body of relayed message
   */
  b?: string
}

/**
 * Event to be relayed to Snapchat server
 */
export class RelayRequest extends IncomingRequest {
  /**
   * Node.js URL object from config.pixelUrl string
   */
  protected static readonly url = new URL(config.pixelUrl);

  /**
   * Outgoing HTTP request object
   */
  protected relayReq?: http.ClientRequest;

  /**
   * Initialize and trigger relay
   * @param req incoming message object
   * @param res server response object
   * @param rawBody incoming request body
   */
  constructor(req: http.IncomingMessage, res: http.ServerResponse, protected readonly rawBody: string) {
    super(req, res);
    let jsonBody: RelayRequestSchema = {};
    try {
      jsonBody = JSON.parse(rawBody);
    } catch (e) {
      this.respond(400, { 'Content-Type': 'application/json' }, '{"error": "Invalid request body"}');
      return;
    }
    const pathname = (typeof jsonBody.p === 'string' && jsonBody.p ? jsonBody.p : RelayRequest.url.pathname);
    const method = (typeof jsonBody.m === 'string' && jsonBody.m ? jsonBody.m : 'POST');
    this.relay(method, pathname, jsonBody.b);
  }

  /**
   * Relay processed incoming request to server
   * @param method HTTP method for the outgoing request
   * @param path HTTP path for the outgoing request
   * @param relayBody HTTP request body for the outgoing request
   */
  protected relay(method: string, path: string, relayBody?: {}): void {
    const protocol = RelayRequest.url.protocol;
    const hostname = RelayRequest.url.hostname;
    const port = RelayRequest.url.port || (protocol === 'https:' ? 443 : 80);
    debug(`[relay] ${method} ${protocol}//${hostname}:${port}${path}`);
    this.relayReq = (protocol === 'https:' ? https : http).request({ hostname, port, path, method }, (res) => this.relayResponse(res));
    this.relayReq.on('error', (err) => {
      logError('[relay] error:', err);
      this.respond(500, { 'Content-Type': 'application/json' }, '{"error": "Server error"}');
    });
    if (relayBody) {
      if (typeof relayBody !== 'string') {
        const ipv4 = this.ipv4;
        const ipv6 = this.ipv6;
        const msg = {
          ...relayBody,
          headers: this.req.headers,
          ipv4: ipv4 ? this.hash(ipv4) : undefined,
          ipv6: ipv6 ? this.hash(ipv6) : undefined
        };
        debug('[relay msg]', msg);
        relayBody = JSON.stringify(msg);
      }
      this.relayReq.write(relayBody);
    }
    this.relayReq.end();
  };

  /**
   * Accept and pass on response to outgoing request as response to original incoming request
   * @param res response to outgoing request
   */
  protected relayResponse(res: http.IncomingMessage): void {
    debug(`[relay response] ${res.statusCode}`);
    let data = '';
    res.on('data', d => {
      data += String(d);
    });
    res.on('error', (e) => {
      logError('[relay response]', e);
      this.respond(500, { 'Content-Type': 'application/json' }, '{"error": "Server error"}');
    });
    res.on('end', () => {
      debug(`[relay response] ${res.statusCode} body: ${data}`);
      this.respond(200, {
        'Content-Type': 'application/json',
        ...this.accessOriginHeader
      }, data);
    });
  }

  /**
   * Generic hashing for sensitive data (standard: sha-256)
   * @param value string to hash
   * @returns hash in hex
   */
  private hash(value: string): string {
    const sha256 = createHash('sha256');
    const hash = sha256.update(value).digest('hex');
    return hash;
  }
}
