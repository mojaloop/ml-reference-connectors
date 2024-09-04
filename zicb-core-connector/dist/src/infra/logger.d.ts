import { ILogger } from '../domain';
import { TJson } from '../domain';
export declare const loggerFactory: (context?: TJson) => ILogger;
export declare class Logger implements ILogger {
    private readonly log;
    private readonly context;
    constructor(context: TJson);
    error(message: string, meta?: TJson): void;
    warn(message: string, meta?: TJson): void;
    trace(message: string, meta?: TJson): void;
    info(message: string, meta?: TJson): void;
    verbose(message: string, meta?: TJson): void;
    debug(message: string, meta?: TJson): void;
    silly(message: string, meta?: TJson): void;
    child(childContext: TJson): Logger;
    private formatLog;
}
