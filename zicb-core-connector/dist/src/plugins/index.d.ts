import { ServerRegisterPluginObject } from '@hapi/hapi';
import { PluginsOptions } from './types';
export declare const createPlugins: (options: PluginsOptions) => ServerRegisterPluginObject<PluginsOptions>[];
