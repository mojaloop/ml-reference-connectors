import "dotenv/config";
import Convict from 'convict';
import { TFineractConfig, TZicbConfig } from './domain/CBSClient';
import { TSDKSchemeAdapterConfig } from './domain/SDKClient';
interface IConfigSchema {
    fineract: TFineractConfig;
    server: {
        SDK_SERVER_HOST: string;
        SDK_SERVER_PORT: number;
        DFSP_SERVER_HOST: string;
        DFSP_SERVER_PORT: number;
    };
    sdkSchemeAdapter: TSDKSchemeAdapterConfig;
    zicb: TZicbConfig;
}
declare const config: Convict.Config<IConfigSchema>;
export type TConfig = Convict.Config<IConfigSchema>;
export default config;
