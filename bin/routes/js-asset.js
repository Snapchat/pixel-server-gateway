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
exports.JSAssetRequest = void 0;
const incoming_request_1 = require("../incoming-request");
const assets_1 = require("../assets");
/**
 * Request handling for prefetched JS asset
 */
class JSAssetRequest extends incoming_request_1.IncomingRequest {
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
     * Send response as soon as JS asset is available
     */
    send() {
        return __awaiter(this, void 0, void 0, function* () {
            const js = this.sourceWithDynamicHost(yield assets_1.assets.js());
            if (js) {
                this.respond(200, { 'Content-Length': Buffer.byteLength(js, 'utf8'), 'Content-Type': 'text/javascript' }, js);
            }
        });
    }
}
exports.JSAssetRequest = JSAssetRequest;
