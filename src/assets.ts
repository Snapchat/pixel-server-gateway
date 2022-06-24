import { promises } from 'fs';
import http2 from 'http2';
import { config } from './config';

/**
 * Retrieve and store various assets.
 * Loads are asynchronous
 */
class Assets {
  /**
   * Storage for assets as strings
   */
  protected readonly cache: {js?: string; rootDoc?: string} = {};

  /**
   * Storage for assets as strings
   */
  protected remotePollTimer?: NodeJS.Timeout;

  /**
   * Retrieve JS asset
   */
  async js(): Promise<string> {
    if (!this.cache.js) {
      const protocol = config.js.split('://')[0];
      console.log('[asset] loading JS source:', config.js);
      if (protocol === 'http' || protocol === 'https') {
        this.cache.js = await this.loadJSRemote();
      } else {
        this.cache.js = await promises.readFile(config.js, 'utf8');
      }
      console.log(`[asset] js cached ${Buffer.byteLength(this.cache.js, 'utf8')} bytes`);
    }
    return this.cache.js;
  }

  /**
   * Retrieve root (/) doc
   */
   async rootDoc(): Promise<string> {
    if (!this.cache.rootDoc) {
      console.log('[asset] loading readme file:', config.rootDoc);
      this.cache.rootDoc = await promises.readFile(config.rootDoc, 'utf8');
    }
    return this.cache.rootDoc;
  }

  /**
   * Load JS asset from remote source via HTTP2
   */
  private async loadJSRemote(): Promise<string> {
    return new Promise((resolve: (value: string) => void, reject: (err: Error) => void): void => {
      const url = new URL(config.js);
      const client = http2.connect(`${url.protocol}//${url.host}`);
      client.on('error', (err) =>  {
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
  }

  /**
   * Set timer for re-fetching remote JS asset
   */
  private loadJSRemoteTimer(): void {
    const hours = +config.jsRefreshHours > 0 ? +config.jsRefreshHours : 12;

    console.log(`[asset] will fetch again in ${hours} hour${hours === 1 ? '' : 's'}`);
    if (this.remotePollTimer) {
      clearTimeout(this.remotePollTimer);
    }
    this.remotePollTimer = setTimeout(() => {
      try {
        this.loadJSRemote();
      } catch (err) {
        console.error(err);
      }
    }, hours * 3600000);
  }
}

/**
 * Assets singleton
 */
export const assets = new Assets();
