import http from 'http';

/**
 * Incoming request base class. Handles basic request/response duties and other common functionality
 */
export abstract class IncomingRequest {
  /**
   * RegEx to identify host string (to be replaced with the requested host)
   * TODO: remove temporary variants as they go away after testing
   */
  protected static readonly hostReplaceRx = /(((http:\/\/((192\.168\.[0-9]{1,3}\.[0-9]{1,3})|localhost):[0-9]{1,4})|LOCAL_SERVER_URL|PAD_SERVER_URL))|\{*\**HOST_URL_GOES_HERE\**\}*/g;

  /**
   * RegEx for IPv4 addresses
   */
  protected static readonly ipv4Rx = /(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/g;

  /**
   * RegEx for IPv6 addresses
   */
  protected static readonly ipv6Rx = /(([0-9A-F]{1,4}:){7}([0-9A-F]{1,4}|:))|(([0-9A-F]{1,4}:){6}(:[0-9A-F]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-F]{1,4}:){5}(((:[0-9A-F]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-F]{1,4}:){4}(((:[0-9A-F]{1,4}){1,3})|((:[0-9A-F]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-F]{1,4}:){3}(((:[0-9A-F]{1,4}){1,4})|((:[0-9A-F]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-F]{1,4}:){2}(((:[0-9A-F]{1,4}){1,5})|((:[0-9A-F]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-F]{1,4}:){1}(((:[0-9A-F]{1,4}){1,6})|((:[0-9A-F]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-F]{1,4}){1,7})|((:[0-9A-F]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))/gi;

  /**
   * Initialize request object, persist `req` and `res` objects on the instance
   * @param req incoming message object
   * @param res server response object
   */
  constructor(protected readonly req: http.IncomingMessage, protected readonly res: http.ServerResponse) {
    console.log('req', req.method, req.url);
  }

  /**
   * Request IPv4 address
   */
  protected get ipv4(): string | undefined {
    return (this.remoteAddr.match(IncomingRequest.ipv4Rx) || [])[0] || undefined;
  }

  /**
   * Request IPv4 address
   */
  protected get ipv6(): string | undefined {
    return (this.remoteAddr.match(IncomingRequest.ipv6Rx) || [])[0] || undefined;
  }

  /**
   * String normalized remoteAddress
   */
  protected get remoteAddr(): string {
    return typeof this.req.socket.remoteAddress === 'string' ? this.req.socket.remoteAddress : '';
  }

  /**
   * Send the response, close connection
   * @param statusCode HTTP response code
   * @param headers HTTP response headers
   * @param body HTTP resonse body
   */
  respond(statusCode: number, headers: http.OutgoingHttpHeaders | http.OutgoingHttpHeader[] | undefined, body?: string): void {
    this.res.writeHead(statusCode, headers);
    if (!body) {
      this.res.end();
    } else {
      this.res.end(body);
    }
  }

  /**
   * Simple JSON response trigger. Implies status 200, and added JSON header
   * @param msg message object. Will be stringified and sent as response body
   */
  respondJSON(msg: {[key: string]: any} | any[]): void {
    this.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(msg));
  }

  /**
   * Dynamic getter for reading request-specific
   * @return single 'Access-Control-Allow-Origin' key object with value from request header: 'origin'
   */
  protected get accessOriginHeader(): http.OutgoingHttpHeaders {
    const origin = this.req.headers['origin'];
    if (!origin) {
      return {};
    }
    return { 'Access-Control-Allow-Origin': origin };
  }

  /**
   * Inject 'host' from request header to the provided source
   * Uses RegEx store on .hostReplaceRx
   * Will respond with 500 status if 'host' is not in the request headers (and return undefined)
   * @param src source to be updated
   * @returns updated string
   */
  protected sourceWithDynamicHost(src: string): string | undefined {
    const host = this.req.headers['host'];
    if (!host) {
      this.respond(500, { 'Content-Type': 'text/html' }, '500 - Server error (missing hostname)')
      return;
    }
    const protocol = this.req.headers.referer?.split('://')[0] || 'https';
    return src.replace(IncomingRequest.hostReplaceRx, `${protocol}://${host}`);
  }
}
