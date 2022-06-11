"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootRequest = void 0;
const incoming_request_1 = require("../incoming-request");
const assets_1 = require("../assets");
class RootRequest extends incoming_request_1.IncomingRequest {
    constructor(req, res) {
        super(req, res);
        this.send();
    }
    send() {
        if (!assets_1.assets.readme) {
            setTimeout(() => this.send(), 100);
            return;
        }
        const readme = this.hostUpdatedSource(assets_1.assets.readme);
        if (readme) {
            this.respond(200, { 'Content-Length': Buffer.byteLength(readme, 'utf8'), 'Content-Type': 'text/html' }, readme);
        }
    }
}
exports.RootRequest = RootRequest;
