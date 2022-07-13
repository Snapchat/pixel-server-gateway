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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const http_1 = __importDefault(require("http"));
const assets_1 = require("./assets");
const config_1 = require("./config");
const log_1 = require("./helpers/log");
const partial_url_1 = require("./helpers/partial-url");
const incoming_request_1 = require("./incoming-request");
const cors_1 = require("./routes/cors");
const js_asset_1 = require("./routes/js-asset");
const not_found_1 = require("./routes/not-found");
const relay_1 = require("./routes/relay");
const root_doc_1 = require("./routes/root-doc");
/**
 * Open interface, listen for connections, route incoming requests
 */
class Server {
    /**
     * Initialize server
     */
    constructor() {
        this.boot();
    }
    /**
     * Boot sequence: load assets, open server
     */
    boot() {
        return __awaiter(this, void 0, void 0, function* () {
            // load assets before opening the server
            yield assets_1.assets.js();
            yield assets_1.assets.rootDoc();
            this.server = http_1.default.createServer((req, res) => this.incoming(req, res));
            this.server.listen(config_1.config.serverPort, config_1.config.serverHost, () => {
                (0, log_1.log)(`[server] listening on ${config_1.config.serverHost}:${config_1.config.serverPort}`);
            });
            this.server.on('error', (err) => {
                (0, log_1.logError)(`[server]`, err);
            });
        });
    }
    /**
     * Incoming request handler. Collects the full request including body, passes on to routing
     * @param req incoming message object
     * @param res server response object
     */
    incoming(req, res) {
        let body = '';
        req.on('data', (chunk) => {
            body += String(chunk);
        });
        req.on('end', () => {
            this.route(req, res, body);
        });
    }
    /**
     * Route request or respond with 404
     * Each "route" is an extension of IncomingRequest class.
     * @param req incoming message object
     * @param res server response object
     * @param body request body
     */
    route(req, res, body = '') {
        let url = (0, partial_url_1.partialURL)(req.url);
        if (url) {
            if (req.method === 'GET' && url.pathname === '/') {
                new root_doc_1.RootDocRequest(req, res);
                return;
            }
            if (req.method === 'GET' && (url.pathname === '/scevent.min.js' || url.pathname === '/s.js')) {
                new js_asset_1.JSAssetRequest(req, res);
                return;
            }
            if (url.pathname === '/r' || url.pathname === '/conversion' || url.pathname === '/v2/conversion') {
                const attachRelayInfo = (url.pathname === '/r');
                if (req.method === 'OPTIONS') {
                    new cors_1.CORSRequest(req, res);
                    return;
                }
                if (incoming_request_1.IncomingRequest.acceptedMethods.includes(req.method || '')) {
                    new relay_1.RelayRequest(req, res, body, url, attachRelayInfo);
                    return;
                }
            }
        }
        new not_found_1.NotFound(req, res);
    }
}
exports.Server = Server;
/**
 * Server singleton
 */
new Server();
