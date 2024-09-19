/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

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
- Kasweka Michael Mukoko <kaswekamukoko@gmail.com>
 - Niza Tembo <mcwayzj@gmail.com>

 --------------
 ******/

 import { IHTTPClient, ILogger } from '../interfaces';
 import { components } from '@mojaloop/api-snippets/lib/sdk-scheme-adapter/v2_1_0/outbound/openapi';

 // TNM Config

 export enum PartyType {
    CONSUMER = 'CONSUMER',
    AGENT = 'AGENT',
    BUSINESS = 'BUSINESS',
    DEVICE = 'DEVICE',
}

 export type TNMConfig = {
     TNM_BASE_URL: string,
     TNM_WALLET: string,
     TNM_PASSWORD: string,
     SUPPORTED_ID_TYPE: components["schemas"]["PartyIdType"],
     SENDING_SERVICE_CHARGE: string;
     RECEIVING_SERVICE_CHARGE: string;
     EXPIRATION_DURATION: string,
     TRANSACTION_ENQUIRY_WAIT_TIME: string,
     FSP_ID: string,
     TNM_CURRENCY: string,
 }

 export type TGetKycArgs = {
    msisdn: string;
 }

 export type TGetTokenArgs = {
     wallet: string;
     password: string;

 }

 export type TnmValidateResponse = {
     message: string;
     errors: string[];
     trace: string[];
     data: {
         full_name: string;
     };
 }

 export type TGetTokenResponse = {
     message: string;
     errors: string[];
     trace: string[];
     data: {
         token: string;
         expires_at: string;
     };
 }


 export type TMakePaymentRequest = {
    msisdn : string;
    amount : string;
    transaction_id: string;
    narration: string
 }

export type TMakePaymentResponse = {
    message: string;
    errors: [];
    trace: [];
    data : {
        transaction_id: string;
        receipt_number: string;
    }
}


export type TNMCallbackPayload = {
    receipt_number: string;
    result_description: string;
    result_code: string;
    result_time: string; //Datetime
    transaction_id: string;
    success: boolean
}

export type TNMCheckPaymentStatus = {

        message: string;
        errors: string[];
        trace: any[];
        data: {
          transaction_id: string;
          receipt_number: string;
          success: boolean;
          result_description: string;
          result_code: string;
          created_at: string;
        };
}

export type TNMRefundMoneyResponse = {
    message: string;
    errors: string[];
    trace: string[];
    data: {
        reversal_transaction_id: string;
    };
 }


 export type TNMInvoiceRequest = {
    invoice_number: string;
    amount: number;
    msisdn: string;
    description: string;
  };

export  type TNMInvoiceResponse = {
    message: string;
    errors: string[];
    trace: any[];
    data: any[];
  };

export  type TNMInvoiceStatusResponse = {
    message: string;
    errors: string[];
    trace: any[];
    data: {
      invoice_number: string;
      amount: string;
      msisdn: string;
      receipt_number: string;
      settled_at: string;
      paid: boolean;
      reversal_transcation_id: string | null;
      reversed: boolean;
      reversed_at: string | null;
    };
};

export type TNMRefundResponse = {
        message: string;
        errors: string[];
        trace: any[];
        data: {
          reversal_transaction_id: string;
        };
};

export type TNMClientFactoryDeps = {
    tnmConfig: TNMConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
};

export type TNMSendMoneyResponse = {
     "payeeDetails": {
         "idType": string;
         "idValue": string;
         "fspId": string;
         "firstName": string;
         "lastName": string;
         "dateOfBirth": string;
     };
     "receiveAmount": string;
     "receiveCurrency": string;
     "fees": string;
     "feeCurrency": string;
     "transactionId": string;
 }




 export type TNMSendMoneyRequest = {
     "homeTransactionId": string;
     "payeeId": string;
     "payeeIdType": components["schemas"]["PartyIdType"];
     "sendAmount": string;
     "sendCurrency": components['schemas']['Currency'];
     "receiveCurrency": string;
     "transactionDescription": string;
     "transactionType": components['schemas']['transferTransactionType'];
     "payer": string;
     "payerAccount": string;
     "dateOfBirth": string;
 }


 export type TNMUpdateSendMoneyRequest = {
     "acceptQuote": boolean;
     "msisdn": string;
     "amount": string;
 }

 export type TNMCollectMoneyRequest = {
     "reference": string;
     "subscriber": {
         "country": string;
         "currency": string;
         "msisdn": string;
     },
     "transaction": {
         "amount": number;
         "country": string;
         "currency": string;
         "id": string;
     }
 }

 export type TNMCollectMoneyResponse = {
     "data": {
         "transaction": {
             "id": string;
             "status": string;
         }
     },
     "status": {
         "code": string;
         "message": string;
         "result_code": string;
         "response_code": string;
         "success": boolean;
     }
 }

 export type TNMRefundMoneyRequest = {

 }




 // Transaction Enquiry Request
 export type TNMTransactionEnquiryRequest = {
     transactionId: string;
 }


 // Transaction Enquiry Response

 export type TNMTransactionEnquiryResponse = {
     "data": {
         "transaction": {
             "airtel_money_id": string,
             "id": string,
             "message": string,
             "status": ETransactionStatus
         }
     },
     "status": {
         "code": string,
         "message": string,
         "result_code": string,
         "response_code": string,
         "success": boolean
     }
 }

 export enum ETransactionStatus {
     TransactionInProgress = "TIP",
     TransactionSuccess = "TS",
     TransactionFailed = "TF",
     TransactionAmbiguous = "TA",
     TransactionExpired = "TE"
 }


 // Interface for IAirtelClient with methods to be implemented in IAirtel
 export interface ITNMClient {
     tnmConfig: TNMConfig;
     httpClient: IHTTPClient;
     logger: ILogger;
     getKyc(deps: TGetKycArgs): Promise<TnmValidateResponse>;
     getToken(deps: TGetTokenArgs): Promise<TGetTokenResponse>;
     makepayment(deps: TMakePaymentRequest): Promise<TMakePaymentResponse>


    //  collectMoney(deps: TNMCollectMoneyRequest): Promise<TNMCollectMoneyResponse>;
    //  refundMoney(deps: TNMRefundMoneyRequest): Promise<TNMRefundMoneyResponse>;
    //  getTransactionEnquiry(deps: TNMTransactionEnquiryRequest): Promise<TNMTransactionEnquiryResponse>;
 }

