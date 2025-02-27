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


 - Niza Tembo <mcwayzj@gmail.com>
 - Okello Ivan Elijah <elijahokello90@gmail.com>

 --------------
 ******/

 'use strict';

 import { TJson } from './types';
 
 export type ErrorOptions = {
     cause?: Error;
     httpCode: number;
     mlCode?: string;
     details?: TJson;
 };
 
 export class BasicError extends Error {
     cause?: Error;
     httpCode?: number;
     mlCode?: string; // Mojaloop error code
     details?: TJson;
 
     constructor(message: string, options?: ErrorOptions) {
         super(message, options);
         Error.captureStackTrace(this, BasicError);
         this.name = this.constructor.name;
         this.httpCode = options?.httpCode;
         this.mlCode = options?.mlCode;
         this.details = options?.details;
     }
 }
 
 export class ValidationError extends BasicError {
     static invalidAccountNumberError() {
         return new ValidationError('Account number length is too short', {
             mlCode: '3101',
             httpCode: 400,
         });
     }
     static invalidReturnedQuoteError(message: string ){
        return new ValidationError(message, {
            mlCode: '5101',
            httpCode: 500,
        });
    }
     static invalidConversionQuoteError(message: string, mlCode: string, httpCode: number){
         return new ValidationError(message, {
             mlCode: mlCode,
             httpCode: httpCode,
         });
     }
     static transferIdNotDefinedError(message: string, mlCode: string, httpCode: number){
         return new ValidationError(message, {
             mlCode: mlCode,
             httpCode: httpCode,
         });
     }
 
     static accountVerificationError() {
         return new ValidationError('Funds Source Account is not active in CBS', {
             mlCode: '3200',
             httpCode: 400, // todo: think, which http code should be used here
         });
     }
 
     static unsupportedIdTypeError() {
         return new ValidationError('Unsupported Id Type', {
             mlCode: '3100',
             httpCode: 400,
         });
     }
 
     static unsupportedCurrencyError(){
         return new ValidationError("Incorrect Currency", {
             mlCode: '5106',
             httpCode: 400,
         }); 
     }
 
     static accountBarredError(){
         return new ValidationError("Account is Barred", {
             mlCode: '5400',
             httpCode: 400,
         });
     }
 
     static invalidQuoteError(message: string){
        return new ValidationError(message, {
            mlCode: '5101',
            httpCode: 400,
        });
    }

 
     static transferNotCompletedError(){
         return new ValidationError("Transfer Not Completed Error", {
             mlCode: '5000',
             httpCode: 500,
         });
     }
 
     static notEnoughInformationError(message: string, mlCode: string){
         return new ValidationError(message, {
             mlCode: mlCode,
             httpCode: 500,
         });
     }
 
     static quoteNotDefinedError(message: string, mlCode: string, httpCode: number){
         return new ValidationError(message, {
             mlCode: mlCode,
             httpCode: httpCode,
         });
     }
 
     static quoteNotAcceptedError(){
         return new ValidationError("Payer rejected transaction request", {
             mlCode: '4101',
             httpCode: 500,
         });
     }


     static invalidExtensionListsError(message: string, mlCode: string, httpCode: number){
        return new ValidationError(message, {
            mlCode: mlCode,
            httpCode: httpCode,
        });
    }
 }
 
 export class MTNError extends BasicError{
     static getTokenFailedError() {
         return new MTNError("Get Token Failed From MTN", {
             httpCode: 500,
             mlCode: '5000',
         });
     }
 
     static getKycError() {
         return new MTNError("Get Kyc Failed", {
             httpCode: 500,
             mlCode: '5000',
         });
     }
 
     static disbursmentError() {
         return new MTNError("Send Money to Beneficiary Failed", {
             httpCode: 500,
             mlCode: '5000',
         });
     }
     static collectMoneyError() {
         return new MTNError("Collect Money from MTN Failed", {
             httpCode: 500,
             mlCode: '4000',
         });
     }
     static refundMoneyError() {
         return new MTNError("Refund Money to MTN Customer Failed", {
             httpCode: 500,
             mlCode: '4000',
         });
     }
     static payeeBlockedError(message: string, httpCode:number, mlCode:string) {
         return new MTNError(message, {
             httpCode: httpCode,
             mlCode: mlCode,
         });
     }
 
     static quoteNotAcceptedError(){
         return new ValidationError("Payer rejected transaction request", {
             mlCode: '4101',
             httpCode: 500,
         });
     }
 
 } 
 