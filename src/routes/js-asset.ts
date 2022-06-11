import http from 'http';
import { IncomingRequest } from '../incoming-request';
import { assets } from '../assets';

/**
 * Request handling for prefetched JS asset
 */
export class JSAssetRequest extends IncomingRequest {
  /**
   * Initialization + trigger immediate response
   * @param req incoming message object
   * @param res server response object
   */
  constructor(req: http.IncomingMessage, res: http.ServerResponse) {
    super(req, res);
    this.send();
  }

  /**
   * Send response as soon as JS asset is available
   */
  protected async send(): Promise<void> {
    const js = this.sourceWithDynamicHost(await assets.js());
    if (js) {
      this.respond(200, { 'Content-Length': Buffer.byteLength(js, 'utf8'), 'Content-Type': 'text/javascript' }, js);
    }
  }
}
