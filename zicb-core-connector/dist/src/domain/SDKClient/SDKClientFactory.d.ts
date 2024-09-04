import { SDKClient } from './SDKClient';
import { IHTTPClient, ILogger } from '../interfaces';
export declare class SDKClientFactory {
    static getSDKClientInstance(logger: ILogger, httpClient: IHTTPClient, sdk_url: string): SDKClient;
}
