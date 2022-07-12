import { URL } from 'url';
import { logError } from './log';

export function partialURL(url: string | undefined): URL | undefined {
  if (url) {
    try {
      return new URL('file://' + url);
    } catch (e) {
      logError('[URL] could not parse URL:', url, e);
      return;
    }
  }
  logError('[URL] missing URL');
}
