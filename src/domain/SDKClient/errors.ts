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


 - Okello Ivan Elijah <elijahokello90@gmail.com>

 --------------
 ******/

'use strict';

import { BasicError, ErrorOptions } from '../interfaces';

export class SDKClientError extends BasicError {
    // think, if it's better to have a separate class
    static continueTransferError(message: string, options?: ErrorOptions) {
        const { httpCode = 500, mlCode = httpCode === 504 ? '2004' : '2001' } = options || {};
        return new SDKClientError(message, { mlCode, httpCode });
    }

    static initiateTransferError(message = 'InitiateTransferError') {
        return new SDKClientError(message, {
            httpCode: 500,
            mlCode: '2000',
        });
    }

    static genericTransferError(message = 'InitiateTransferError') {
        return new SDKClientError(message, {
            httpCode: 500,
            mlCode: '2000',
        });
    }

    static noQuoteReturnedError() {
        return new SDKClientError('Quote response is not defined', {
            httpCode: 500,
            mlCode: '3200',
        });
    }

    static genericQuoteValidationError(message: string, options?: ErrorOptions) {
        return new SDKClientError(message, options);
    }

    static returnedCurrentStateUnsupported(message: string, options: ErrorOptions ){
        return new SDKClientError(
            message,
            options
        );
    }

    static getTransfersError(message: string, options: ErrorOptions){
        return new SDKClientError(
            message,
            options
        );
    }

    static postAccountsError(message: string, options: ErrorOptions){
        return new SDKClientError(
            message,
            options
        );
    }

    static deleteAccountsError(message: string, options: ErrorOptions){
        return new SDKClientError(
            message,
            options
        );
    }
}
