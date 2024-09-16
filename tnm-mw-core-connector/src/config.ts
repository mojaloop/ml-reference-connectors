import "dotenv/config";
import Convict from 'convict';
import { TNMConfig } from "./domain/CBSClient";

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
    tnm:TNMConfig;
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
    tnm:{
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
        CLIENT_WALLET: {
            doc: 'TNM Client Wallet ID',
            format: String,
            default: null, // required
            env: 'CLIENT_WALLET',
        },
        CLIENT_PASSWORD: {
            doc: 'TNM Client Password',
            format: String,
            default: null, // required
            env: 'CLIENT_PASSWORD',
        },
        SUPPORTED_ID_TYPE: {
            doc: 'Supported Type',
            format: String,
            default: null, // required
            env: 'SUPPORTED_ID_TYPE',
        },
        SERVICE_CHARGE: {
            doc: '',
            format: String,
            default: null, //
            env: 'SERVICE_CHARGE',
        },
        EXPIRATION_DURATION: {
            doc: '',
            format: String,
            default: null, // required
            env: '',
        },
        TOKEN: {
            doc: '',
            format: String,
            default: null, // required
            env: '',
        },
        TRANSACTION_ENQUIRY_WAIT_TIME: {
            doc: '',
            format: String,
            default: null, // required
            env: '',
        },
        FSP_ID: {
            doc: '',
            format: String,
            default: null, // required
            env: '',
        },
        TNM_CURRENCY: {
            doc: 'Local Currency',
            format: String,
            default: null,
            env: 'TNM_CURRENCY',
        }


        // TNM_BASE_URL: string;
        // CLIENT_WALLET: string;
        // CLIENT_PASSWORD: string;
        // SUPPORTED_ID_TYPE: components["schemas"]["PartyIdType"];
        // SERVICE_CHARGE: string;
        // EXPIRATION_DURATION: string;
        // TOKEN: string;
        // TRANSACTION_ENQUIRY_WAIT_TIME: number
        // FSP_ID: string
    }
});

config.validate({ allowed: 'strict' });

export type TConfig = Convict.Config<IConfigSchema>;

export default config;
