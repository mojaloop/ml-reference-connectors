import 'dotenv/config';
import Convict from 'convict';
import { IdType, TAirtelConfig, TFineractConfig } from './domain/CBSClient';
import { TSDKSchemeAdapterConfig } from './domain/SDKClient';

interface IConfigSchema {
    fineract: TFineractConfig;
    server: {
        SDK_SERVER_HOST: string;
        SDK_SERVER_PORT: number;
        DFSP_SERVER_HOST: string;
        DFSP_SERVER_PORT: number;
    };
    airtel: TAirtelConfig;
    sdkSchemeAdapter: TSDKSchemeAdapterConfig;
}

const config = Convict<IConfigSchema>({
    fineract: {
        FINERACT_BASE_URL: {
            doc: 'Base URL for fineract instance',
            format: String,
            default: null, // required
            env: 'FINERACT_BASE_URL',
        },
        FINERACT_TENANT_ID: {
            doc: 'Fineract Tenant ID to use',
            format: String,
            default: null,
            env: 'FINERACT_TENANT_ID',
        },
        FINERACT_AUTH_MODE: {
            doc: 'Authentication Mode for Fineract. Basic or oauth',
            format: String,
            default: null, // required
            env: 'FINERACT_AUTH_MODE',
        },
        FINERACT_USERNAME: {
            doc: 'Username for fineract user for basic auth',
            format: String,
            default: null, // required
            env: 'FINERACT_USERNAME',
        },
        FINERACT_PASSWORD: {
            doc: 'Password for fineract user for basic auth',
            format: String,
            default: null, // required
            env: 'FINERACT_PASSWORD',
        },
        FINERACT_BANK_ID: {
            doc: 'Bank ID for IBAN',
            format: String,
            default: null, // required
            env: 'FINERACT_BANK_ID',
        },
        FINERACT_ACCOUNT_PREFIX: {
            doc: 'Account prefix for IBAN',
            format: String,
            default: null, // required
            env: 'FINERACT_ACCOUNT_PREFIX',
        },
        FINERACT_BANK_COUNTRY_CODE: {
            doc: 'Bank country code for IBAN',
            format: String,
            default: null, // required
            env: 'FINERACT_BANK_COUNTRY_CODE',
        },
        FINERACT_CHECK_DIGITS: {
            doc: 'Check digits for IBAN',
            format: String,
            default: null, // required
            env: 'FINERACT_CHECK_DIGITS',
        },
        FINERACT_ID_TYPE: {
            doc: 'Mojaloop ID Type to be used',
            format: String,
            default: IdType.IBAN,
        },
        FINERACT_LOCALE: {
            doc: 'Date locale to be used',
            format: String,
            default: null, // required
            env: 'FINERACT_LOCALE',
        },
        FINERACT_PAYMENT_TYPE_ID: {
            doc: 'Payment Type Id to be used for Mojaloop Payments',
            format: String,
            default: null, // required
            env: 'FINERACT_PAYMENT_TYPE_ID',
        },
    },
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
    },
});

config.validate({ allowed: 'strict' });

export type TConfig = Convict.Config<IConfigSchema>;

export default config;
