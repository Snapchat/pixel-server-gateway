"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayRequest = void 0;
const crypto_1 = require("crypto");
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const url_1 = require("url");
const incoming_request_1 = require("../incoming-request");
const config_1 = require("../config");
const log_1 = require("../helpers/log");
/**
 * Event to be relayed to Snapchat server
 */
class RelayRequest extends incoming_request_1.IncomingRequest {
    /**
     * Initialize and trigger relay
     * @param req incoming message object
     * @param res server response object
     * @param rawBody incoming request body
     * @param url parsed URL
     * @param attachRelayInfo triggers adding original context to the relayed request
     */
    constructor(req, res, rawBody, url, attachRelayInfo = false) {
        super(req, res);
        this.rawBody = rawBody;
        this.url = url;
        this.attachRelayInfo = attachRelayInfo;
        /**
         * Whether the incoming request's content type is JSON
         */
        this.isJSON = false;
        let jsonBody = {};
        try {
            jsonBody = JSON.parse(rawBody);
            this.isJSON = true;
        }
        catch (e) { }
        const pathname = this.meta(jsonBody, 'p', 'p', 'x-capi-path') || (attachRelayInfo ? config_1.config.pixelPath : config_1.config.v2conversionPath);
        const method = this.meta(jsonBody, 'm', 'm', 'x-capi-method') || req.method;
        const testStr = this.meta(jsonBody, 't', 't', 'x-capi-test-mode');
        const testMode = !!(testStr && typeof testStr === 'string' && testStr.toLowerCase() !== 'false' && testStr.toLowerCase() !== 'f');
        const body = (attachRelayInfo && this.isJSON && typeof jsonBody.b === 'object' && jsonBody.p && jsonBody.m ? jsonBody.b :
            (attachRelayInfo && this.isJSON ? jsonBody : undefined));
        if (method && pathname) {
            this.relay(method, pathname, body, testMode);
        }
        else if (this.isJSON) {
            this.respond(400, { 'Content-Type': 'application/json' }, '{"status":"ERROR","reason":"Invalid request"}');
        }
        else {
            this.respond(400, { 'Content-Type': 'text/plain' }, 'Invalid request');
        }
    }
    /**
     * Get metadata from optional JSON body, optional URL info, or headers (in this order of precedence). Used for targeting path, HTTP method, test target
     * @param jsonBody optional JSON schema
     * @param jsonKey key for JSON schema
     * @param urlKey query string parameter key
     * @param headerKey header key
     * @returns metadata
     */
    meta(jsonBody, jsonKey, urlKey, headerKey) {
        const jsonValue = jsonBody[jsonKey];
        if (jsonValue && (typeof jsonValue === 'string' || typeof jsonValue === 'boolean')) {
            return String(jsonValue);
        }
        const urlValue = this.url.searchParams.get(urlKey);
        if (urlValue) {
            return urlValue;
        }
        const headerValue = this.req.headers[headerKey];
        if (headerValue) {
            return Array.isArray(headerValue) ? headerValue[0] : headerValue;
        }
    }
    /**
     * Relay processed incoming request to server
     * @param method HTTP method for the outgoing request
     * @param path HTTP path for the outgoing request
     * @param relayBody HTTP request body for the outgoing request
     */
    relay(method, path, relayBody, testMode) {
        const url = new url_1.URL((testMode ? config_1.config.pixelServerTestHost : config_1.config.pixelServerHost) + path);
        const protocol = url.protocol;
        const hostname = url.hostname;
        const port = url.port || (protocol === 'https:' ? 443 : 80);
        (0, log_1.debug)(`[relay] ${method} ${protocol}//${hostname}:${port}${path}`);
        this.relayReq = (protocol === 'https:' ? https_1.default : http_1.default).request({ hostname, port, path, method }, (res) => this.relayResponse(res));
        this.relayReq.on('error', (err) => {
            (0, log_1.logError)('[relay] error:', err);
            this.respond(500, { 'Content-Type': 'application/json' }, '{"error": "Server error"}');
        });
        if (this.req.headers['authorization']) {
            this.relayReq.setHeader('Authorization', this.req.headers['authorization']);
        }
        if (relayBody && typeof relayBody === 'object') {
            const ipv4 = this.ipv4;
            const ipv6 = this.ipv6;
            const msg = Object.assign(Object.assign({}, relayBody), { headers: this.req.headers, ipv4: ipv4 ? this.hash(ipv4) : undefined, ipv6: ipv6 ? this.hash(ipv6) : undefined });
            (0, log_1.debug)('[relay msg]', msg);
            this.relayReq.write(JSON.stringify(msg));
        }
        else if (this.rawBody) {
            (0, log_1.debug)('[relay msg]', this.rawBody);
            this.relayReq.write(this.rawBody);
        }
        this.relayReq.end();
    }
    ;
    /**
     * Accept and pass on response to outgoing request as response to original incoming request
     * @param res response to outgoing request
     */
    relayResponse(res) {
        (0, log_1.debug)(`[relay response] ${res.statusCode}`);
        let data = '';
        res.on('data', d => {
            data += String(d);
        });
        res.on('error', (e) => {
            (0, log_1.logError)('[relay response]', e);
            this.respond(500, { 'Content-Type': 'application/json' }, '{"error": "Server error"}');
        });
        res.on('end', () => {
            (0, log_1.debug)(`[relay response] ${res.statusCode} body: ${data}`);
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
        const hash = sha256.update(value).digest('hex');
        return hash;
    }
}
exports.RelayRequest = RelayRequest;
