import 'dotenv/config';
import Convict from 'convict';
import { TAirtelConfig } from './domain/CBSClient';
import { TSDKSchemeAdapterConfig } from './domain/SDKClient';

interface IConfigSchema {
    server: {
        SDK_SERVER_HOST: string;
        SDK_SERVER_PORT: number;
        DFSP_SERVER_HOST: string;
        DFSP_SERVER_PORT: number;
        HTTP_TIMEOUT: number;
    };
    airtel: TAirtelConfig;
    sdkSchemeAdapter: TSDKSchemeAdapterConfig;
}

const config = Convict<IConfigSchema>({
    server: {
        HTTP_TIMEOUT: {
            doc: 'HTTP Timeout seconds',
            format: Number,
            default: null, // required
            env: 'HTTP_TIMEOUT',
        },
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
    airtel: {
        AIRTEL_BASE_URL: {
            doc: 'Airtel Base URL',
            format: String,
            default: null, // required
            env: 'AIRTEL_BASE_URL',
        },
        CLIENT_ID: {
            doc: 'Client Id',
            format: String,
            default: null, // required
            env: 'CLIENT_ID',
        },
        CLIENT_SECRET: {
            doc: 'Client Secret',
            format: String,
            default: null, // required
            env: 'CLIENT_SECRET',
        },
        GRANT_TYPE: {
            doc: 'Grant Type',
            format: String,
            default: null, // required
            env: 'GRANT_TYPE',
        },
        X_COUNTRY: {
            doc: 'Country Name',
            format: String,
            default: null, // required
            env: 'X_COUNTRY',
        },
        X_CURRENCY: {
            doc: 'Country Currency',
            format: String,
            default: null, // required
            env: 'X_CURRENCY',
        },
        SUPPORTED_ID_TYPE: {
            doc: 'Supported ID Type',
            format: String,
            default: null, // required
            env: 'SUPPORTED_ID_TYPE',
        },
        SERVICE_CHARGE: {
            doc: 'Service Charge',
            format: String,
            default: null, // required
            env: 'SERVICE_CHARGE',
        },
        EXPIRATION_DURATION: {
            doc: 'Expiration Duration for Quotes',
            format: String,
            default: null, // required
            env: 'EXPIRATION_DURATION',
        },

        AIRTEL_PIN: {
            doc: 'Airtel Pin for Disbursements',
            format: String,
            default: null, // required
            env: 'AIRTEL_PIN',
        },

        TRANSACTION_ENQUIRY_WAIT_TIME: {
            doc: 'Airtel check transaction interval',
            format: String,
            default: null, // required
            env: 'TRANSACTION_ENQUIRY_WAIT_TIME',
        },

        FSP_ID: {
            doc: 'Mojaloop FSP Is',
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
    },
});

config.validate({ allowed: 'strict' });

export type TConfig = Convict.Config<IConfigSchema>;

export default config;
