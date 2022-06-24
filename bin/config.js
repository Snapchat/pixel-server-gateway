"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
/**
 * Static configuration
 */
exports.config = {
    /**
     * Source of scevent.min.js. Default: 'https://sc-static.net/scevent.min.js'. You may use local file (relative path) for testing
     */
    // js: 'https://sc-static.net/scevent.min.js',
    js: 'static/scevent.min.js',
    /**
     * Poll cycle for updating scevent.min.js
     */
    jsRefreshHours: 12,
    /**
     * Event relay target. Default: 'https://tr.snapchat.com/gateway/p'
     */
    pixelUrl: 'https://tr.snapchat.com/gateway/p',
    /**
     * Local file source for root (/) document on the server. Should be an HTML file.
     */
    rootDoc: 'static/readme.html',
    /**
     * Interface to open for the server to start listening. '0.0.0.0' opens all interfaces.
     */
    serverHost: '0.0.0.0',
    /**
     * Port to listen on
     */
    serverPort: 8080
};
