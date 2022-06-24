"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootDocRequest = void 0;
const incoming_request_1 = require("../incoming-request");
const assets_1 = require("../assets");
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
class RootDocRequest extends incoming_request_1.IncomingRequest {
    /**
     * Initialization + trigger immediate response
     * @param req incoming message object
     * @param res server response object
     */
    constructor(req, res) {
        super(req, res);
        this.send();
    }
    /**
     * Send response as soon as rootDoc asset is available
     * Injects `pxIdUpdateJS`
     */
    send() {
        return __awaiter(this, void 0, void 0, function* () {
            let readme = this.sourceWithDynamicHost(yield assets_1.assets.rootDoc());
            if (readme) {
                readme = readme.replace(/(<\/head>)/i, pxIdUpdateJS + '$1');
                this.respond(200, { 'Content-Length': Buffer.byteLength(readme, 'utf8'), 'Content-Type': 'text/html' }, readme);
            }
        });
    }
}
exports.RootDocRequest = RootDocRequest;
