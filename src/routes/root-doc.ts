import http from 'http';
import { IncomingRequest } from '../incoming-request';
import { assets } from '../assets';

/**
 * Script to add dynamic Pixel ID from hash fragment
 */
const pxIdUpdateJS = `
<script type="text/javascript">
  try {
    document.addEventListener('DOMContentLoaded', function() {
      try {
        if (location.hash.substr(0, 6) == '#pxid=') {
          var id = location.hash.substr(6);
          var node;
          var walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
          while (id && (node = walk.nextNode())) {
            if (node.textContent.indexOf('{{***PIXEL_ID_GOES_HERE***}}') > -1) {
              node.textContent = node.textContent.split('{{***PIXEL_ID_GOES_HERE***}}').join(id);
            }
          }
        }
      } catch (e) {}
    });
  } catch (e) {}
</script>
`;

/**
 * Request handling for root (/)
 */
export class RootDocRequest extends IncomingRequest {
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
   * Send response as soon as rootDoc asset is available
   * Injects `pxIdUpdateJS`
   */
  protected async send(): Promise<void> {
    let readme = this.sourceWithDynamicHost(await assets.rootDoc());
    if (readme) {
      readme = readme.replace(/(<\/head>)/i, pxIdUpdateJS + '$1');
      this.respond(200, { 'Content-Length': Buffer.byteLength(readme, 'utf8'), 'Content-Type': 'text/html' }, readme);
    }
  }
}
