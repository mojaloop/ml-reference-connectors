import "dotenv/config";
import Convict from 'convict';
import { TSDKSchemeAdapterConfig } from './domain/SDKClient';
import { TCBSConfig } from "./domain/CBSClient";

interface IConfigSchema {
    server: {
        SDK_SERVER_HOST: string;
        SDK_SERVER_PORT: number;
        DFSP_SERVER_HOST: string;
        DFSP_SERVER_PORT: number;
    };
    sdkSchemeAdapter: TSDKSchemeAdapterConfig;
    cbs:TCBSConfig;
}

const config = Convict<IConfigSchema>({
    server: {
        SDK_SERVER_HOST: {
            doc: 'SDK Server host',
            format: String,
            default: null, // required
            env: 'SDK_SERVER_HOST',
        },
        SDK_SERVER_PORT: {
            doc: 'SDK Server port',
            format: Number,
            default: 3000, // optional
            env: 'SDK_SERVER_PORT',
        },
        DFSP_SERVER_HOST: {
            doc: 'DFSP operations app Server host',
            format: String,
            default: null, // required
            env: 'DFSP_SERVER_HOST',
        },
        DFSP_SERVER_PORT: {
            doc: 'dfsp operations app Server port',
            format: Number,
            default: null, // required
            env: 'DFSP_SERVER_PORT',
        },
    },
    sdkSchemeAdapter: {
        SDK_BASE_URL: {
            doc: 'SDK Scheme Adapter Base URL',
            format: String,
            default: null, // required
            env: 'SDK_BASE_URL',
        },
    },
    cbs:{
        CBS_NAME: {
            doc: 'Name of the DFSP',
            format: String,
            default: null, // required
            env: 'CBS_NAME',
        },
    }
});

config.validate({ allowed: 'strict' });

export type TConfig = Convict.Config<IConfigSchema>;

export default config;
