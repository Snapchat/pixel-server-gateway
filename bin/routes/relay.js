"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayRequest = void 0;
const crypto_1 = require("crypto");
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const incoming_request_1 = require("../incoming-request");
const config_1 = require("../config");
/**
 * Event to be relayed to Snapchat server
 */
class RelayRequest extends incoming_request_1.IncomingRequest {
    /**
     * Initialize and trigger relay
     * @param req incoming message object
     * @param res server response object
     * @param rawBody incoming request body
     */
    constructor(req, res, rawBody) {
        super(req, res);
        this.rawBody = rawBody;
        let jsonBody = {};
        try {
            jsonBody = JSON.parse(rawBody);
        }
        catch (e) {
            this.respond(400, { 'Content-Type': 'application/json' }, '{"error": "Invalid request body"}');
            return;
        }
        const pathname = (typeof jsonBody.p === 'string' && jsonBody.p ? jsonBody.p : RelayRequest.url.pathname);
        const method = (typeof jsonBody.m === 'string' && jsonBody.m ? jsonBody.m : 'POST');
        this.relay(method, pathname, jsonBody.b);
    }
    /**
     * Relay processed incoming request to server
     * @param method HTTP method for the outgoing request
     * @param path HTTP path for the outgoing request
     * @param relayBody HTTP request body for the outgoing request
     */
    relay(method, path, relayBody) {
        const protocol = RelayRequest.url.protocol;
        const hostname = RelayRequest.url.hostname;
        const port = RelayRequest.url.port || (protocol === 'https:' ? 443 : 80);
        console.log(`[relay] ${method} ${protocol}//${hostname}:${port}${path}`);
        this.relayReq = (protocol === 'https:' ? https_1.default : http_1.default).request({ hostname, port, path, method }, (res) => this.relayResponse(res));
        this.relayReq.on('error', (err) => {
            console.error('[relay] error:', err);
            this.respond(500, { 'Content-Type': 'application/json' }, '{"error": "Server error"}');
        });
        if (relayBody) {
            if (typeof relayBody !== 'string') {
                const ipv4 = this.ipv4;
                const ipv6 = this.ipv6;
                const msg = Object.assign(Object.assign({}, relayBody), { headers: this.req.headers, ipv4: ipv4 ? this.hash(ipv4) : undefined, ipv6: ipv6 ? this.hash(ipv6) : undefined });
                console.log('[relay msg]', msg);
                relayBody = JSON.stringify(msg);
            }
            this.relayReq.write(relayBody);
        }
        this.relayReq.end();
    }
    ;
    /**
     * Accept and pass on response to outgoing request as response to original incoming request
     * @param res response to outgoing request
     */
    relayResponse(res) {
        console.log(`[relay response] ${res.statusCode}`);
        let data = '';
        res.on('data', d => {
            data += String(d);
        });
        res.on('error', (e) => {
            console.log('[relay response] ERROR:', e);
            this.respond(500, { 'Content-Type': 'application/json' }, '{"error": "Server error"}');
        });
        res.on('end', () => {
            console.log(`[relay response] ${res.statusCode} body: ${data}`);
            this.respond(200, Object.assign({ 'Content-Type': 'application/json' }, this.accessOriginHeader), data);
        });
    }
    /**
     * Generic hashing for sensitive data (standard: sha-256)
     * @param value string to hash
     * @returns hash in hex
     */
    hash(value) {
        const sha256 = (0, crypto_1.createHash)('sha256');
        const hash = sha256.update(value).digest('base64');
        return hash;
    }
}
exports.RelayRequest = RelayRequest;
/**
 * Node.js URL object from config.pixelUrl string
 */
RelayRequest.url = new URL(config_1.config.pixelUrl);
