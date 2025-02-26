import "dotenv/config";
import Convict from 'convict';
import { TCBSConfig } from "./domain/CBSClient";

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
    }
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
    cbs:{
        CBS_NAME: {
            doc: 'Name of the DFSP',
            format: String,
            default: null, // required
            env: 'CBS_NAME',
        },
        DFSP_BASE_URL:{
            doc: 'API Base URL',
            format: String,
            default: null, // required
            env: 'DFSP_BASE_URL',
        },
        CLIENT_ID:{
            doc: 'Client ID for api user',
            format: String,
            default: null, // required
            env: 'CLIENT_ID',
        },
        CLIENT_SECRET:{
            doc: 'Client Secret for api user',
            format: String,
            default: null, // required
            env: 'CLIENT_SECRET',
        },
        GRANT_TYPE:{
            doc: 'Airtel Grant Type',
            format: String,
            default: null, // required
            env: 'GRANT_TYPE',
        },
        X_COUNTRY:{
            doc: 'Country',
            format: String,
            default: null, // required
            env: 'X_COUNTRY',
        },
        X_CURRENCY:{
            doc: 'Currency',
            format: String,
            default: null, // required
            env: 'X_CURRENCY',
        },
        SUPPORTED_ID_TYPE:{
            doc: 'Supported Id Type',
            format: String,
            default: null, // required
            env: 'SUPPORTED_ID_TYPE',
        },
        SENDING_SERVICE_CHARGE:{
            doc: 'Charge for sending money to customer account',
            format: String,
            default: null, // required
            env: 'SENDING_SERVICE_CHARGE',
        },
        RECEIVING_SERVICE_CHARGE:{
            doc: 'Charge for collecting money from customer account',
            format: String,
            default: null, // required
            env: 'RECEIVING_SERVICE_CHARGE',
        },
        EXPIRATION_DURATION:{
            doc: 'Quote expiration duration',
            format: String,
            default: null, // required
            env: 'EXPIRATION_DURATION',
        },
        AIRTEL_PIN:{
            doc: 'Airtel disbursement PIN',
            format: String,
            default: null, // required
            env: 'AIRTEL_PIN',
        },
        FSP_ID:{
            doc: 'FSP Identifier',
            format: String,
            default: null, // required
            env: 'FSP_ID',
        },
        LEI:{
            doc: 'Legal Entity Identifier',
            format: String,
            default: null, // required
            env: 'LEI',
        }
    }
});

config.validate({ allowed: 'strict' });

export type TConfig = Convict.Config<IConfigSchema>;

export default config;
