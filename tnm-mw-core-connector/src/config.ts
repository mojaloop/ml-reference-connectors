import 'dotenv/config';
import Convict from 'convict';
import { TNMConfig } from './domain/CBSClient';

interface IConfigSchema {
    server: {
        SDK_SERVER_HOST: string;
        SDK_SERVER_PORT: number;
        DFSP_SERVER_HOST: string;
        DFSP_SERVER_PORT: number;
        DFSP_API_SPEC_FILE: string;
        SDK_API_SPEC_FILE: string;
    };
    sdkSchemeAdapter: {
        SDK_BASE_URL: string;
    };
    tnm: TNMConfig;
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
        DFSP_API_SPEC_FILE: {
            doc: 'DFSP operations app Server host',
            format: String,
            default: null, // required
            env: 'DFSP_API_SPEC_FILE',
        },
        SDK_API_SPEC_FILE: {
            doc: 'DFSP operations app Server host',
            format: String,
            default: null, // required
            env: 'SDK_API_SPEC_FILE',
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
    tnm: {
        CBS_NAME: {
            doc: 'Name of the DFSP',
            format: String,
            default: null, // required
            env: 'CBS_NAME',
        },
        TNM_BASE_URL: {
            doc: 'TNM Base URL',
            format: String,
            default: null, // required
            env: 'TNM_BASE_URL',
        },
        TNM_WALLET: {
            doc: 'TNM Client Wallet ID',
            format: String,
            default: null, // required
            env: 'TNM_WALLET',
        },
        TNM_PASSWORD: {
            doc: 'TNM Client Password',
            format: String,
            default: null, // required
            env: 'TNM_PASSWORD',
        },
        SUPPORTED_ID_TYPE: {
            doc: 'Supported Type',
            format: String,
            default: null, // required
            env: 'SUPPORTED_ID_TYPE',
        },
        EXPIRATION_DURATION: {
            doc: 'Expiration Duration for Quotes',
            format: String,
            default: null, // required
            env: 'EXPIRATION_DURATION',
        },
        FSP_ID: {
            doc: 'Identifier for the DFSP',
            format: String,
            default: null, // required
            env: 'FSP_ID',
        },
        LEI:{
            doc: 'Legal Entity Identifier',
            format: String,
            default: null, // required
            env: 'LEI',
        },
        TNM_CURRENCY: {
            doc: 'Local Currency',
            format: String,
            default: null,
            env: 'TNM_CURRENCY',
        },
        X_COUNTRY:{
            doc: 'Country',
            format: String,
            default: null, // required
            env: 'X_COUNTRY',
        },
        RECEIVING_SERVICE_CHARGE: {
            doc: 'Percentage charged by TNM on request to pay',
            format: String,
            default: null,
            env: 'RECEIVING_SERVICE_CHARGE',
        },
        SENDING_SERVICE_CHARGE: {
            doc: 'Amount charged by TNM on disbursement to a customer wallet',
            format: String,
            default: null,
            env: 'SENDING_SERVICE_CHARGE',
        },
    },
});

config.validate({ allowed: 'strict' });

export type TConfig = Convict.Config<IConfigSchema>;

export default config;
