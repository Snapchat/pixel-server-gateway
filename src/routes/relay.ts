import { createHash } from 'crypto';
import http from 'http';
import https from 'https';
import { URL } from 'url';

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
  
  /**
   * test (shadow) target
   */
  t?: boolean
}

/**
 * Event to be relayed to Snapchat server
 */
export class RelayRequest extends IncomingRequest {
  /**
   * Outgoing HTTP request object
   */
  protected relayReq?: http.ClientRequest;

  /** 
   * Whether the incoming request's content type is JSON
   */
  protected readonly isJSON: boolean = false;

  /**
   * Initialize and trigger relay
   * @param req incoming message object
   * @param res server response object
   * @param rawBody incoming request body
   * @param url parsed URL
   * @param attachRelayInfo triggers adding original context to the relayed request
   */
  constructor(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    protected readonly rawBody: string,
    protected readonly url: URL,
    protected readonly attachRelayInfo = false
  ) {
    super(req, res);
    let jsonBody: RelayRequestSchema = {};
    try {
      jsonBody = JSON.parse(rawBody);
      this.isJSON = true;
    } catch (e) {}
    const pathname = this.meta(jsonBody, 'p', 'p', 'x-capi-path') || (attachRelayInfo ? config.pixelPath : config.v2conversionPath);
    const method = this.meta(jsonBody, 'm', 'm', 'x-capi-method') || req.method;
    const testStr = this.meta(jsonBody, 't', 't', 'x-capi-test-mode');
    const testMode = !!(testStr && typeof testStr === 'string' && testStr.toLowerCase() !== 'false' && testStr.toLowerCase() !== 'f');
    const body = (attachRelayInfo && this.isJSON && typeof jsonBody.b === 'object' && jsonBody.p && jsonBody.m ? jsonBody.b :
      (attachRelayInfo && this.isJSON ? jsonBody : undefined));
    if (method && pathname) {
      this.relay(method, pathname, body, testMode);
    } else if (this.isJSON) {
      this.respond(400, { 'Content-Type': 'application/json' }, '{"status":"ERROR","reason":"Invalid request"}');
    } else {
      this.respond(400, { 'Content-Type': 'text/plain' }, 'Invalid request');
    }
  }

  /**
   * Get metadata from optional JSON body, optional URL info, or headers (in this order of precedence). Used for targeting path, HTTP method, test target
   * @param jsonBody optional JSON schema
   * @param jsonKey key for JSON schema
   * @param urlKey query string parameter key
   * @param headerKey header key
   * @returns metadata
   */
  protected meta(jsonBody: RelayRequestSchema, jsonKey: keyof RelayRequestSchema, urlKey: string, headerKey: string): string | undefined {
    const jsonValue = jsonBody[jsonKey];
    if (jsonValue && (typeof jsonValue === 'string' || typeof jsonValue === 'boolean')) {
      return String(jsonValue);
    }
    const urlValue = this.url.searchParams.get(urlKey);
    if (urlValue) {
      return urlValue;
    }
    const headerValue = this.req.headers[headerKey];
    if (headerValue) {
      return Array.isArray(headerValue) ? headerValue[0] : headerValue;
    }
  }

  /**
   * Relay processed incoming request to server
   * @param method HTTP method for the outgoing request
   * @param path HTTP path for the outgoing request
   * @param relayBody HTTP request body for the outgoing request
   */
  protected relay(method: string, path: string, relayBody?: object, testMode?: boolean): void {
    const url = new URL((testMode ? config.pixelServerTestHost : config.pixelServerHost) + path);
    const protocol = url.protocol;
    const hostname = url.hostname;
    const port = url.port || (protocol === 'https:' ? 443 : 80);
    debug(`[relay] ${method} ${protocol}//${hostname}:${port}${path}`);
    this.relayReq = (protocol === 'https:' ? https : http).request({ hostname, port, path, method }, (res) => this.relayResponse(res));
    this.relayReq.on('error', (err) => {
      logError('[relay] error:', err);
      this.respond(500, { 'Content-Type': 'application/json' }, '{"error": "Server error"}');
    });
    if (this.req.headers['authorization']) {
      this.relayReq.setHeader('Authorization', this.req.headers['authorization']);
    }
    if (relayBody && typeof relayBody === 'object') {
      const ipv4 = this.ipv4;
      const ipv6 = this.ipv6;
      const msg = {
        ...relayBody,
        headers: this.req.headers,
        ipv4: ipv4 ? this.hash(ipv4) : undefined,
        ipv6: ipv6 ? this.hash(ipv6) : undefined
      };
      debug('[relay msg]', msg);
      this.relayReq.write(JSON.stringify(msg));
    } else if (this.rawBody) {
      debug('[relay msg]', this.rawBody);
      this.relayReq.write(this.rawBody);
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
