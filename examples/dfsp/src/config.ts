import 'dotenv/config';
import Convict from 'convict';
import { TBlueBankConfig } from '.';
import { IConnectorConfigSchema } from '@mojaloop/core-connector-lib';

export const config = Convict<IConnectorConfigSchema<TBlueBankConfig, never>>({
    server: {
        SDK_SERVER_HOST: {
            doc: 'SDK Server host',
            format: String,
            default: null, // required
            env: 'SDK_SERVER_HOST',
        },
        CBS_NAME: {
            doc: 'Core Banking System Name',
            format: String,
            default: null, // required
            env: 'CBS_NAME',
        },
        SDK_SERVER_PORT: {
            doc: 'SDK Server port',
            format: Number,
            default: null, // required
            env: 'SDK_SERVER_PORT',
        },
        DFSP_SERVER_HOST: {
            doc: 'DFSP Server host',
            format: String,
            default: null, // required
            env: 'DFSP_SERVER_HOST',
        },
        DFSP_SERVER_PORT: {
            doc: 'DFSP Server port',
            format: Number,
            default: null, // required
            env: 'DFSP_SERVER_PORT',
        },
        MODE: {
            doc: 'Core Connector Mode. dfsp or fxp',
            format: String,
            default: null, // required
            env: 'MODE',
        },
    },
    sdkSchemeAdapter: {
        SDK_BASE_URL: {
            doc: 'SDK Outbound Server Host',
            format: String,
            default: null, // required
            env: 'SDK_BASE_URL',
        },
    },
    cbs: {
        FSP_ID: {
            doc: 'FSP_ID',
            format: String,
            default: null, // required
            env: 'FSP_ID',
        },
        LEI: {
            doc: 'Legal Entity Identifier',
            format: String,
            default: null, // required
            env: 'LEI',
        },
        CURRENCY: {
            doc: 'CURRENCY',
            format: String,
            default: null, // required
            env: 'CURRENCY',
        },
        SUPPORTED_ID_TYPE: {
            doc: 'SUPPORTED_ID_TYPE',
            format: String,
            default: null, // required
            env: 'SUPPORTED_ID_TYPE',
        },
        CURRENCY_MODE: {
            doc: 'CURRENCY_MODE',
            format: String,
            default: null, // required
            env: 'CURRENCY_MODE',
        },
        config: {
            // Change this to your variables
            BLUE_BANK_URL: {
                doc: 'Base URL for Blue Bank DFSP',
                format: String,
                default: null, // required
                env: 'BLUE_BANK_URL',
            },
            BLUE_BANK_CLIENT_ID: {
                doc: 'API User',
                format: String,
                default: null, // required
                env: 'BLUE_BANK_CLIENT_ID',
            },
            BLUE_BANK_CLIENT_SECRET: {
                doc: 'API Secret',
                format: String,
                default: null, // required
                env: 'BLUE_BANK_CLIENT_SECRET',
            },
        },
    },
});

config.validate({ allowed: 'strict' });

export type TConfig = Convict.Config<IConnectorConfigSchema<TBlueBankConfig, never>>;

export const getDFSPConfig = (): IConnectorConfigSchema<TBlueBankConfig, never> => {
    return config.getProperties();
};

export const dfspConfig: IConnectorConfigSchema<TBlueBankConfig, never> = getDFSPConfig();
