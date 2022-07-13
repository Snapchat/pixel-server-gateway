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
exports.assets = void 0;
const fs_1 = require("fs");
const http2_1 = __importDefault(require("http2"));
const config_1 = require("./config");
const log_1 = require("./helpers/log");
/**
 * Retrieve and store various assets.
 * Loads are asynchronous
 */
class Assets {
    constructor() {
        /**
         * Storage for assets as strings
         */
        this.cache = {};
    }
    /**
     * Retrieve JS asset
     */
    js() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cache.js) {
                const src = config_1.config.debug && config_1.config.debugJs || config_1.config.js;
                const protocol = src.split('://')[0];
                (0, log_1.log)('[asset] loading JS source:', src);
                if (!config_1.config.debug || protocol === 'http' || protocol === 'https') {
                    this.cache.js = yield this.loadJSRemote();
                }
                else {
                    this.cache.js = yield fs_1.promises.readFile(src, 'utf8');
                }
                (0, log_1.log)(`[asset] js cached ${Buffer.byteLength(this.cache.js, 'utf8')} bytes`);
            }
            return this.cache.js;
        });
    }
    /**
     * Retrieve root (/) doc
     */
    rootDoc() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cache.rootDoc) {
                (0, log_1.log)('[asset] loading readme file:', config_1.config.rootDoc);
                this.cache.rootDoc = yield fs_1.promises.readFile(config_1.config.rootDoc, 'utf8');
            }
            return this.cache.rootDoc;
        });
    }
    /**
     * Load JS asset from remote source via HTTP2
     */
    loadJSRemote() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const url = new URL(config_1.config.js);
                const client = http2_1.default.connect(`${url.protocol}//${url.host}`);
                client.on('error', (err) => {
                    this.loadJSRemoteTimer();
                    reject(err);
                });
                const req = client.request({ ':path': url.pathname });
                req.on('response', () => {
                    let data = '';
                    req.on('data', (chunk) => {
                        data += chunk;
                    });
                    req.on('end', () => {
                        client.close();
                        this.loadJSRemoteTimer();
                        resolve(data);
                    });
                });
                req.setEncoding('utf8');
                req.end();
            });
        });
    }
    /**
     * Set timer for re-fetching remote JS asset
     */
    loadJSRemoteTimer() {
        const hours = +config_1.config.jsRefreshHours > 0 ? +config_1.config.jsRefreshHours : 12;
        (0, log_1.log)(`[asset] will fetch again in ${hours} hour${hours === 1 ? '' : 's'}`);
        if (this.remotePollTimer) {
            clearTimeout(this.remotePollTimer);
        }
        this.remotePollTimer = setTimeout(() => {
            try {
                this.loadJSRemote();
            }
            catch (err) {
                (0, log_1.logError)(err);
            }
        }, hours * 3600000);
    }
}
/**
 * Assets singleton
 */
exports.assets = new Assets();
