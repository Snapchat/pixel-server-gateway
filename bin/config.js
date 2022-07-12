"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
/**
 * Static configuration
 */
exports.config = {
    /**
     * Debug mode. Will trigger output some extra logs,
     */
    debug: false,
    /**
     * Load JS from alternative source (local relative path allowed)
     */
    debugJs: 'static/scevent.min.js',
    /**
     * Source of scevent.min.js. Default: 'https://sc-static.net/scevent.min.js'. You may use local file (relative path) for testing
     */
    js: 'https://sc-static.net/scevent.min.js',
    /**
     * Poll cycle for updating scevent.min.js
     */
    jsRefreshHours: 1,
    /**
     * Pixel.JS relay target. Default: '/gateway/p'. Full URL is composed with pixelServerHost or pixelServerTestHost.
     */
    pixelPath: '/gateway/p',
    /**
     * Relay target host (production)
     */
    pixelServerHost: 'https://tr.snapchat.com',
    /**
     * Relay target host (for test scenarios)
     */
    pixelServerTestHost: 'https://tr-shadow.snapchat.com',
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
    serverPort: 8080,
    /**
     * Conversion event relay target. Default: '/v2/conversion'. Full URL is composed with pixelServerHost or pixelServerTestHost.
     */
    v2conversionPath: '/v2/conversion',
};
