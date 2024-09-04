"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// todo: fix all TS issues in this file (central-services-logger exports Winston interface, but implements it badly!)
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.loggerFactory = void 0;
const tslib_1 = require("tslib");
const central_services_logger_1 = tslib_1.__importDefault(require("@mojaloop/central-services-logger"));
const fast_safe_stringify_1 = tslib_1.__importDefault(require("fast-safe-stringify"));
const makeLogString = (message, meta) => meta ? `${message} - ${typeof meta === 'object' ? (0, fast_safe_stringify_1.default)(meta) : meta}` : message;
// todo: set logLevel from config
const loggerFactory = (context = {}) => new Logger(context);
exports.loggerFactory = loggerFactory;
class Logger {
    log = central_services_logger_1.default;
    context = {};
    // todo: make context TJson | string
    constructor(context) {
        this.context = context;
    }
    error(message, meta) {
        this.log.isErrorEnabled && this.log.error(this.formatLog(message, meta));
    }
    warn(message, meta) {
        this.log.isWarnEnabled && this.log.warn(this.formatLog(message, meta));
    }
    trace(message, meta) {
        this.log.isTraceEnabled && this.log.trace(this.formatLog(message, meta));
    }
    info(message, meta) {
        this.log.isInfoEnabled && this.log.info(this.formatLog(message, meta));
    }
    verbose(message, meta) {
        this.log.isVerboseEnabled && this.log.verbose(this.formatLog(message, meta));
    }
    debug(message, meta) {
        this.log.isDebugEnabled && this.log.debug(this.formatLog(message, meta));
    }
    silly(message, meta) {
        this.log.isLevelEnabled && this.log.silly(this.formatLog(message, meta));
    }
    // todo: make childContext TJson | string
    child(childContext) {
        return new Logger(Object.assign({}, this.context, childContext));
    }
    formatLog(message, meta = {}) {
        // todo: get requestId (using AsyncLocalStorage)
        return makeLogString(message, Object.assign({}, meta, this.context));
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map