"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORSRequest = void 0;
const incoming_request_1 = require("../incoming-request");
/**
 * Request handling for OPTIONS request
 */
class CORSRequest extends incoming_request_1.IncomingRequest {
    /**
     * Initialization + immediate response
     * @param req incoming message object
     * @param res server response object
     */
    constructor(req, res) {
        super(req, res);
        if (!this.accessOriginHeader) {
            this.respond(400, {}, 'Origin required for pre-flight request');
            return;
        }
        const allowedHeaders = req.headers['access-control-request-headers'];
        const headers = Object.assign({ 'Access-Control-Allow-Methods': incoming_request_1.IncomingRequest.acceptedMethods.join(', ') }, this.accessOriginHeader);
        if (allowedHeaders) {
            headers['Access-Control-Allow-Headers'] = allowedHeaders;
        }
        this.respond(206, headers, '');
    }
}
exports.CORSRequest = CORSRequest;
