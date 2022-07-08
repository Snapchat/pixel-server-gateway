import { config } from '../config';
import { dateToIso } from './date-to-iso';

/**
 * Output debug info on console.log if config.debug is enabled
 * Adds ISO timestamp
 * @param msgParts 
 */
export function debug(...msgParts: any[]): void {
  if (config.debug) {
    console.log(dateToIso(new Date()), 'DBG', ...msgParts);
  }
}

/**
 * Output log on console.log
 * Adds ISO timestamp
 * @param msgParts 
 */
export function log(...msgParts: any[]): void {
  console.log(dateToIso(new Date()), 'LOG', ...msgParts);
}

/**
 * Output error on console.error
 * Adds ISO timestamp
 * @param msgParts 
 */
export function logError(...msgParts: any[]): void {
  console.error(dateToIso(new Date()), 'ERR', ...msgParts);
}
