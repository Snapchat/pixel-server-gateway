"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.log = exports.debug = void 0;
const config_1 = require("../config");
const date_to_iso_1 = require("./date-to-iso");
/**
 * Output debug info on console.log if config.debug is enabled
 * Adds ISO timestamp
 * @param msgParts
 */
function debug(...msgParts) {
    if (config_1.config.debug) {
        console.log((0, date_to_iso_1.dateToIso)(new Date()), 'DBG', ...msgParts);
    }
}
exports.debug = debug;
/**
 * Output log on console.log
 * Adds ISO timestamp
 * @param msgParts
 */
function log(...msgParts) {
    console.log((0, date_to_iso_1.dateToIso)(new Date()), 'LOG', ...msgParts);
}
exports.log = log;
/**
 * Output error on console.error
 * Adds ISO timestamp
 * @param msgParts
 */
function logError(...msgParts) {
    console.error((0, date_to_iso_1.dateToIso)(new Date()), 'ERR', ...msgParts);
}
exports.logError = logError;
