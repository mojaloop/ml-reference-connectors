import { Plugin } from '@hapi/hapi';
import { ILogger } from '../domain';
export type LoggingPluginOptions = {
    logger: ILogger;
};
export declare const loggingPlugin: Plugin<LoggingPluginOptions>;
