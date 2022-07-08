
/**
 * Static configuration
 */
export const config = {
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
