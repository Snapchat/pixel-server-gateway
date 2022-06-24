"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFound = void 0;
const incoming_request_1 = require("../incoming-request");
/**
 * 404 response
 */
class NotFound extends incoming_request_1.IncomingRequest {
    /**
     * Initialize and send response immediately
     * @param req incoming message object
     * @param res server response object
     */
    constructor(req, res) {
        super(req, res);
        this.respond(404, { 'Content-Type': 'application/json' }, '{"error": "Not Found"}');
    }
}
exports.NotFound = NotFound;
