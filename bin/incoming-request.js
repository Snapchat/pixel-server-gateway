"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingRequest = void 0;
const log_1 = require("./helpers/log");
/**
 * Incoming request base class. Handles basic request/response duties and other common functionality
 */
class IncomingRequest {
    /**
     * Initialize request object, persist `req` and `res` objects on the instance
     * @param req incoming message object
     * @param res server response object
     */
    constructor(req, res) {
        this.req = req;
        this.res = res;
        (0, log_1.debug)('req', req.method, req.url);
    }
    /**
     * Request IPv4 address
     */
    get ipv4() {
        return (this.remoteAddr.match(IncomingRequest.ipv4Rx) || [])[0] || undefined;
    }
    /**
     * Request IPv4 address
     */
    get ipv6() {
        return (this.remoteAddr.match(IncomingRequest.ipv6Rx) || [])[0] || undefined;
    }
    /**
     * String normalized remoteAddress
     */
    get remoteAddr() {
        return typeof this.req.socket.remoteAddress === 'string' ? this.req.socket.remoteAddress : '';
    }
    /**
     * Send the response, close connection
     * @param statusCode HTTP response code
     * @param headers HTTP response headers
     * @param body HTTP resonse body
     */
    respond(statusCode, headers, body) {
        if (statusCode >= 400) {
            (0, log_1.logError)('[server] request error:', statusCode, 'for', this.req.method, this.req.url);
        }
        this.res.writeHead(statusCode, headers);
        if (!body) {
            this.res.end();
        }
        else {
            this.res.end(body);
        }
    }
    /**
     * Simple JSON response trigger. Implies status 200, and added JSON header
     * @param msg message object. Will be stringified and sent as response body
     */
    respondJSON(msg) {
        this.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(msg));
    }
    /**
     * Dynamic getter for reading request-specific
     * @return single 'Access-Control-Allow-Origin' key object with value from request header: 'origin'
     */
    get accessOriginHeader() {
        const origin = this.req.headers['origin'];
        if (!origin) {
            return {};
        }
        return { 'Access-Control-Allow-Origin': origin };
    }
    /**
     * Inject 'host' from request header to the provided source
     * Uses RegEx store on .hostReplaceRx
     * Will respond with 500 status if 'host' is not in the request headers (and return undefined)
     * @param src source to be updated
     * @returns updated string
     */
    sourceWithDynamicHost(src) {
        var _a;
        const host = this.req.headers['host'];
        if (!host) {
            this.respond(500, { 'Content-Type': 'text/html' }, '500 - Server error (missing hostname)');
            return;
        }
        const protocol = ((_a = this.req.headers.referer) === null || _a === void 0 ? void 0 : _a.split('://')[0]) || 'https';
        return src.replace(IncomingRequest.hostReplaceRx, `${protocol}://${host}`);
    }
}
exports.IncomingRequest = IncomingRequest;
/**
 * HTTP methods accepted for requests
 */
IncomingRequest.acceptedMethods = ['GET', 'DELETE', 'PATCH', 'POST', 'PUT'];
/**
 * RegEx to identify host string (to be replaced with the requested host)
 * TODO: remove temporary variants as they go away after testing
 */
IncomingRequest.hostReplaceRx = /(((http:\/\/((192\.168\.[0-9]{1,3}\.[0-9]{1,3})|localhost):[0-9]{1,4})|LOCAL_SERVER_URL|PAD_SERVER_URL))|\{*\**HOST_URL_GOES_HERE\**\}*/g;
/**
 * RegEx for IPv4 addresses
 */
IncomingRequest.ipv4Rx = /(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/g;
/**
 * RegEx for IPv6 addresses
 */
IncomingRequest.ipv6Rx = /(([0-9A-F]{1,4}:){7}([0-9A-F]{1,4}|:))|(([0-9A-F]{1,4}:){6}(:[0-9A-F]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-F]{1,4}:){5}(((:[0-9A-F]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-F]{1,4}:){4}(((:[0-9A-F]{1,4}){1,3})|((:[0-9A-F]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-F]{1,4}:){3}(((:[0-9A-F]{1,4}){1,4})|((:[0-9A-F]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-F]{1,4}:){2}(((:[0-9A-F]{1,4}){1,5})|((:[0-9A-F]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-F]{1,4}:){1}(((:[0-9A-F]{1,4}){1,6})|((:[0-9A-F]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-F]{1,4}){1,7})|((:[0-9A-F]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))/gi;
