import http from 'http';
import { IncomingRequest } from '../incoming-request';

/**
 * Request handling for OPTIONS request
 */
export class CORSRequest extends IncomingRequest {
  /**
   * Initialization + immediate response
   * @param req incoming message object
   * @param res server response object
   */
  constructor(req: http.IncomingMessage, res: http.ServerResponse) {
    super(req, res);
    if (!this.accessOriginHeader) {
      this.respond(400, {}, 'Origin required for pre-flight request');
      return;
    }
    const allowedHeaders = req.headers['access-control-request-headers'];
    const headers: http.OutgoingHttpHeaders = {
      'Access-Control-Allow-Methods': 'POST',
      ...this.accessOriginHeader
    };
    if (allowedHeaders) {
      headers['Access-Control-Allow-Headers'] = allowedHeaders;
    }
    this.respond(206, headers, '{"error": "Not Found"}');
  }
}
