import 'dotenv/config';
import Convict from 'convict';
import { TBlueBankConfig } from '.';
import { IConnectorConfigSchema } from '@mojaloop/core-connector-lib';

export const config = Convict<IConnectorConfigSchema<never, TBlueBankConfig>>({
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
    fxpConfig: {
        FXP_BASE_URL: {
            doc: 'FXP Base URL',
            format: String,
            default: null, // required
            env: 'FXP_BASE_URL',
        },
        config: {
            BLUE_BANK_URL: {
                doc: 'Bank API Base URL',
                format: String,
                default: null, // required
                env: 'BLUE_BANK_URL',
            },
            BLUE_BANK_CLIENT_ID: {
                doc: 'Bank API Client ID',
                format: String,
                default: null, // required
                env: 'BLUE_BANK_CLIENT_ID',
            },
            BLUE_BANK_CLIENT_SECRET: {
                doc: 'Bank API Client Secret ',
                format: String,
                default: null, // required
                env: 'BLUE_BANK_CLIENT_SECRET',
            },
        },
    },
});

config.validate({ allowed: 'strict' });

export type TConfig = Convict.Config<IConnectorConfigSchema<never, TBlueBankConfig>>;

export const fxpConfig: IConnectorConfigSchema<never, TBlueBankConfig> = config.getProperties();

export default config;
