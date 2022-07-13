"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partialURL = void 0;
const url_1 = require("url");
const log_1 = require("./log");
function partialURL(url) {
    if (url) {
        try {
            return new url_1.URL('file://' + url);
        }
        catch (e) {
            (0, log_1.logError)('[URL] could not parse URL:', url, e);
            return;
        }
    }
    (0, log_1.logError)('[URL] missing URL');
}
exports.partialURL = partialURL;
