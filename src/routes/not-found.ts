import http from 'http';
import { logError } from '../helpers/log';
import { IncomingRequest } from '../incoming-request';

/**
 * 404 response
 */
export class NotFound extends IncomingRequest {
  /**
   * Initialize and send response immediately
   * @param req incoming message object
   * @param res server response object
   */
  constructor(req: http.IncomingMessage, res: http.ServerResponse) {
    super(req, res);
    this.respond(404, { 'Content-Type': 'application/json' }, '{"error": "Not Found"}');
  }
}
