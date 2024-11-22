import 'dotenv/config';
import Convict from 'convict';
import { TMTNConfig } from './domain/CBSClient';
import { TSDKSchemeAdapterConfig } from './domain/SDKClient';

interface IConfigSchema {
    server: {
        SDK_SERVER_HOST: string;
        SDK_SERVER_PORT: number;
        DFSP_SERVER_HOST: string;
        DFSP_SERVER_PORT: number;
        SDK_API_SPEC_FILE: string;
    };
    mtn: TMTNConfig;
    sdkSchemeAdapter: TSDKSchemeAdapterConfig;
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
        SDK_API_SPEC_FILE: {
            doc: 'Path to SDK Backend API Spec',
            format: String,
            default: null, // required
            env: 'SDK_API_SPEC_FILE',
        },
        DFSP_API_SPEC_FILE: {
            doc: 'Path to Send Money API Spec',
            format: String,
            default: null, // required
            env: 'DFSP_API_SPEC_FILE',
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
    mtn: {
        MTN_BASE_URL: {
            doc: 'MTN Base URL',
            format: String,
            default: null, // required
            env: 'MTN_BASE_URL',
        },
        MTN_API_KEY: {
            doc: 'MTN API KEY',
            format: String,
            default: null, // required
            env: 'MTN_API_KEY',
        },
        MTN_CLIENT_ID: {
            doc: 'MTN CLIENT ID',
            format: String,
            default: null, // required
            env: 'MTN_CLIENT_ID',
        },
        MTN_SUBSCRIPTION_KEY: {
            doc: 'MTN SUBSCRIPTION KEY',
            format: String,
            default: null, // required
            env: 'MTN_SUBSCRIPTION_KEY',
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
        FSP_ID: {
            doc: 'Mojaloop FSP ID',
            format: String,
            default: null, // required
            env: 'FSP_ID',
        },
        MTN_TARGET_ENVIRONMENT: {
            doc: 'MTN Target Environment',
            format: String,
            default: null, // required
            env: 'MTN_TARGET_ENVIRONMENT',
        },
        MTN_ENCODED_CREDENTIALS: {
            doc: 'MTN Encoded Credentials',
            format: String,
            default: null, // required
            env: 'MTN_ENCODED_CREDENTIALS',
        },
        TRANSACTION_ENQUIRY_WAIT_TIME: {
            doc: 'Transaction Enquiry Wait Time (in seconds)',
            format: Number,
            default: 30, // default wait time
            env: 'TRANSACTION_ENQUIRY_WAIT_TIME',
        },
    },
});

config.validate({ allowed: 'strict' });

export type TConfig = Convict.Config<IConfigSchema>;

export default config;
