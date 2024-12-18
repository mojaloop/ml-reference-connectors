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

 import { BasicError } from '../interfaces';

 export class CBSError extends BasicError {
     static withdrawFailedError(message: string) {
         return new CBSError(message, {
             httpCode: 500,
             mlCode: '4000',
         });
     }

     static searchAccountError(message: string) {
         return new CBSError(message, {
             httpCode: 500,
             mlCode: '3200',
         });
     }

     static noAccountFoundError() {
         return new CBSError('CBS Account Not Found', {
             httpCode: 404,
             mlCode: '3200',
         });
     }

     static accountNotActiveError() {
         return new CBSError('CBS Account not active', {
             httpCode: 500,
             mlCode: '4000',
         });
     }

     static getClientWithIdError() {
         return new CBSError('Failed to get client by clientId ', {
             httpCode: 500,
             mlCode: '4000',
         });
     }

     static depositFailedError() {
         return new CBSError('CBS Deposit Failed', {
             httpCode: 500,
             mlCode: '4000',
         });
     }

     static getChargesError() {
         return new CBSError('CBS Get charges error', {
             httpCode: 500,
             mlCode: '4000',
         });
     }

     static accountInsufficientBalanceError() {
         return new CBSError('CBS Account Insufficient Balance', {
             httpCode: 500,
             mlCode: '4001',
         });
     }

     static accountDebitOrCreditBlockedError(message: string) {
         return new CBSError(message, {
             httpCode: 500,
             mlCode: '4400', // todo: or 5400
         });
     }
 }

 //TNM Errors
 export class TNMError extends BasicError{
     static getTokenFailedError() {
         return new TNMError("Authentication Failed", {
             httpCode: 500,
             mlCode: '5000',
         });
     }

     static getKycError() {
         return new TNMError("User Not Available", {
             httpCode: 500,
             mlCode: '5000',
         });
     }

     static sendMoneyError() {
         return new TNMError("Send Money to Beneficiary Failed", {
             httpCode: 500,
             mlCode: '5000',
         });
     }
     static collectMoneyError() {
         return new TNMError("Collect Money from TNM Failed", {
             httpCode: 500,
             mlCode: '4000',
         });
     }
     static refundMoneyError() {
         return new TNMError("Refund Money to TNM Customer Failed", {
             httpCode: 500,
             mlCode: '4000',
         });
     }
     static payeeBlockedError(message: string, httpCode:number, mlCode:string) {
         return new TNMError(message, {
             httpCode: httpCode,
             mlCode: mlCode,
         });
     }
 }