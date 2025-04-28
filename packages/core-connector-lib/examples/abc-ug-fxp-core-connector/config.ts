import 'dotenv/config';
import Convict from 'convict';
import { IConnectorConfigSchema } from "@mojaloop/core-connector-lib";
import { TBlueBankConfig } from '.';

export const config = Convict<IConnectorConfigSchema<TBlueBankConfig, never>>({
    server: {
        SDK_SERVER_HOST: {
            doc: 'SDK Server host',
            format: String,
            default: null, // required
            env: 'SDK_SERVER_HOST',
        },
        CBS_NAME: {
            doc: 'SDK Server host',
            format: String,
            default: null, // required
            env: 'SDK_SERVER_HOST',
        },
        SDK_SERVER_PORT: {
            doc: 'SDK Server host',
            format: Number,
            default: null, // required
            env: 'SDK_SERVER_HOST',
        },
        DFSP_SERVER_HOST: {
            doc: 'SDK Server host',
            format: String,
            default: null, // required
            env: 'SDK_SERVER_HOST',
        },
        DFSP_SERVER_PORT: {
            doc: 'SDK Server host',
            format: String,
            default: null, // required
            env: 'SDK_SERVER_HOST',
        },
        DFSP_API_SPEC_FILE: {
            doc: 'SDK Server host',
            format: String,
            default: null, // required
            env: 'SDK_SERVER_HOST',
        },
        SDK_API_SPEC_FILE: {
            doc: 'SDK Server host',
            format: String,
            default: null, // required
            env: 'SDK_SERVER_HOST',
        },
        MODE: {
            doc: 'SDK Server host',
            format: String,
            default: null, // required
            env: 'SDK_SERVER_HOST',
        },
    },
    sdkSchemeAdapter: {
        SDK_BASE_URL: {
            doc: 'SDK Server host',
            format: String,
            default: null, // required
            env: 'SDK_SERVER_HOST',
        },
    },
    cbs: {
        FSP_ID: {
            doc: 'SDK Server host',
            format: String,
            default: null, // required
            env: 'SDK_SERVER_HOST',
        },
        LEI: {
            doc: 'SDK Server host',
            format: String,
            default: null, // required
            env: 'SDK_SERVER_HOST',
        },
        CURRENCY: {
            doc: 'SDK Server host',
            format: String,
            default: null, // required
            env: 'SDK_SERVER_HOST',
        },
        SUPPORTED_ID_TYPE: {
            doc: 'SDK Server host',
            format: String,
            default: null, // required
            env: 'SDK_SERVER_HOST',
        },
        config: {
            BLUE_BANK_URL: {
                doc: 'SDK Server host',
                format: String,
                default: null, // required
                env: 'SDK_SERVER_HOST',
            },
            BLUE_BANK_CLIENT_ID: {
                doc: 'SDK Server host',
                format: String,
                default: null, // required
                env: 'SDK_SERVER_HOST',
            },
            BLUE_BANK_CLIENT_SECRET: {
                doc: 'SDK Server host',
                format: String,
                default: null, // required
                env: 'SDK_SERVER_HOST',
            },
        },
    }

})

config.validate({ allowed: 'strict' });

export type TConfig = Convict.Config<IConnectorConfigSchema<object, never>>;

export default config;