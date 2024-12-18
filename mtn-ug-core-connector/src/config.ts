/*****
 License
 --------------
 Copyright © 2020-2024 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.


 Contributors
 --------------
 This is the official list (alphabetical ordering) of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.


 * Niza Tembo <mcwayzj@gmail.com>
 * Elijah Okello <elijahokello90@gmail.com>
 --------------
 ******/

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
        DFSP_API_SPEC_FILE: string;
        CONNECTOR_NAME: string;
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
        CONNECTOR_NAME: {
            doc: 'Name of the Connector',
            format: String,
            default: null, // required
            env: 'CONNECTOR_NAME',
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
        MTN_COLLECTION_API_KEY: {
            doc: 'MTN COLLECTION API KEY',
            format: String,
            default: null, // required
            env: 'MTN_COLLECTION_API_KEY',
        },
        MTN_COLLECTION_CLIENT_ID: {
            doc: 'MTN COLLECTION CLIENT ID',
            format: String,
            default: null, // required
            env: 'MTN_COLLECTION_CLIENT_ID',
        },
        MTN_COLLECTION_SUBSCRIPTION_KEY: {
            doc: 'MTN COLLECTION_SUBSCRIPTION KEY',
            format: String,
            default: null, // required
            env: 'MTN_COLLECTION_SUBSCRIPTION_KEY',
        },
        MTN_DISBURSEMENT_API_KEY: {
            doc: 'MTN DISBURSEMENT API KEY',
            format: String,
            default: null, // required
            env: 'MTN_DISBURSEMENT_API_KEY',
        },
        MTN_DISBURSEMENT_CLIENT_ID: {
            doc: 'MTN DISBURSEMENT CLIENT ID',
            format: String,
            default: null, // required
            env: 'MTN_DISBURSEMENT_CLIENT_ID',
        },
        MTN_DISBURSEMENT_SUBSCRIPTION_KEY: {
            doc: 'MTN DISBURSEMENT_SUBSCRIPTION KEY',
            format: String,
            default: null, // required
            env: 'MTN_DISBURSEMENT_SUBSCRIPTION_KEY',
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
