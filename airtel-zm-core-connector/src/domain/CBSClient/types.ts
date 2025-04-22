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
- Kasweka Michael Mukoko <kaswekamukoko@gmail.com>
 - Niza Tembo <mcwayzj@gmail.com>

 --------------
 ******/

import { IHTTPClient, ILogger } from '../interfaces';
import { components } from '@mojaloop/api-snippets/lib/sdk-scheme-adapter/v2_1_0/outbound/openapi';

export enum IdType {
    MSISDN = 'MSISDN',
    IBAN = 'IBAN',
    ACCOUNT_NO = 'ACCOUNT_NO',
    EMAIL = 'EMAIL',
    PERSONAL_ID = 'PERSONAL_ID',
    BUSINESS = 'BUSINESS',
    DEVICE = 'DEVICE',
    ACCOUNT_ID = 'ACCOUNT_ID',
    ALIAS = 'ALIAS',
}

export enum PartyType {
    CONSUMER = 'CONSUMER',
    AGENT = 'AGENT',
    BUSINESS = 'BUSINESS',
    DEVICE = 'DEVICE',
}

export type TAirtelClientFactoryDeps = {
    airtelConfig: TAirtelConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
};

export type TCalculateQuoteDeps = {
    amount: number;
};

export type TCalculateQuoteResponse = {
    feeAmount: number;
};

// Airtel Config

export type TAirtelConfig = {
    AIRTEL_BASE_URL: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    GRANT_TYPE: string;
    X_COUNTRY: string;
    X_CURRENCY: components["schemas"]["Currency"];
    SUPPORTED_ID_TYPE: components["schemas"]["PartyIdType"];
    SERVICE_CHARGE: string;
    EXPIRATION_DURATION: string;
    AIRTEL_PIN: string;
    TRANSACTION_ENQUIRY_WAIT_TIME: number
    FSP_ID:string;
    LEI: string;
}

export type TGetKycArgs = {
    msisdn: string;

}

export type TGetTokenArgs = {
    client_id: string;
    client_secret: string;
    grant_type: string;
}

export type TAirtelKycResponse = {
    "data": {
        "first_name": string;
        "grade": string;
        "is_barred": boolean;
        "is_pin_set": boolean;
        "last_name": string;
        "msisdn": string;
        "dob": string;
        "account_status": string;
        "nationatility": string;
        "id_number": string;
        "registration": {
            "status": string
        }
    };
    "status": {
        "code": string;
        "message": string;
        "result_code": string;
        "success": boolean
    }
}

export type TGetTokenResponse = {
    "access_token": string;
    "expires_in": string;
    "token_type": string
}


export type TAirtelDisbursementRequestBody = {
    "payee": {
        "msisdn": string,
        "wallet_type": string,
    },
    "reference": string,
    "pin": string,
    "transaction": {
        "amount": number,
        "id": string,
        "type": string
    }
}

export type TAirtelDisbursementResponse = {
    "data": {
        "transaction": {
            "reference_id": string,
            "airtel_money_id": string,
            "id": string,
            "status": string,
            "message": string,
        }
    },
    "status": {
        "response_code": string,
        "code": string,
        "success": boolean,
        "message": string,
    }
}


//  Send Money to CC 

// Request coming from Airtel
export type TAirtelSendMoneyRequest = {
    "homeTransactionId": string;
    "payeeId": string;
    "payeeIdType": components["schemas"]["PartyIdType"];
    "sendCurrency": components['schemas']['Currency'];
    "sendAmount": string;
    "receiveAmount": string;
    "receiveCurrency": components['schemas']['Currency'];
    "transactionDescription": string;
    "transactionType": components['schemas']['transferTransactionType'];
    payer: {
        name: string;
        payerId: string;
        DateAndPlaceOfBirth: {
            BirthDt: string;
            PrvcOfBirth: string;
            CityOfBirth: string;
            CtryOfBirth: string;
        };
    };
}

//  Response sent to Airtel

export type TAirtelSendMoneyResponse = {
    "payeeDetails": {
        "idType": string;
        "idValue": string;
        "fspId": string;
        "name":string;
      };
    "sendAmount": string,
    "sendCurrency": string,
    "receiveAmount": string,
    "receiveCurrency": string,
    "targetFees": string,
    "sourceFees": string,
    "transactionId": string;
    "homeTransactionId": string;
}

export type TAirtelMerchantPaymentRequest = {
    "homeTransactionId": string;
    "payeeId": string;
    "payeeIdType": components["schemas"]["PartyIdType"];
    "sendCurrency": components['schemas']['Currency'];
    "receiveAmount": string;
    "receiveCurrency": components['schemas']['Currency'];
    "transactionDescription": string;
    "transactionType": components['schemas']['transferTransactionType'];
    "payer": {
        "name": string;
        "payerId": string;
        "DateAndPlaceOfBirth": {
            "BirthDt": string;
            "PrvcOfBirth": string;
            "CityOfBirth": string;
            "CtryOfBirth": string;
        }
    }
}

export type TAirtelMerchantPaymentResponse = TAirtelSendMoneyResponse


//  Update Send Money Request( Has no response body(returns 200))

export type TAirtelUpdateSendMoneyRequest = {
    "acceptQuote": boolean;
    "msisdn": string;
    "amount": string;
}

//  Update Merchant Payment Request
export type TAirtelUpdateMerchantPaymentRequest = TAirtelUpdateSendMoneyRequest;

export type TAirtelCollectMoneyRequest = {
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

export type TAirtelCollectMoneyResponse = {
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

export type TAirtelRefundMoneyRequest = {
    "transaction": {
        "airtel_money_id": string;
    }
}

export type TAirtelRefundMoneyResponse = {
    "data": {
        "transaction": {
            "airtel_money_id": string;
            "status": string;
        }
    },
    "status": {
        "code": string;
        "message": string;
        "result_code": string;
        "success": boolean;
    }
}

// Transaction Enquiry Request
export type TAirtelTransactionEnquiryRequest = {
    transactionId : string;
}


// Transaction Enquiry Response

export type TAirtelTransactionEnquiryResponse = {
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
    TransactionAmbiguous="TA",
    TransactionExpired="TE"
}


// Callback Type
export type TCallbackRequest = {
    "transaction": {
        "id": string;
        "message": string;
        "status_code": string;
        "airtel_money_id": string;
    }
}

// Interface for IAirtelClient with methods to be implemented in IAirtel
export interface IAirtelClient {
    airtelConfig: TAirtelConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
    getKyc(deps: TGetKycArgs): Promise<TAirtelKycResponse>;
    getToken(deps: TGetTokenArgs): Promise<TGetTokenResponse>;
    sendMoney(deps: TAirtelDisbursementRequestBody): Promise<TAirtelDisbursementResponse>;
    collectMoney(deps: TAirtelCollectMoneyRequest): Promise<TAirtelCollectMoneyResponse>;
    refundMoney(deps: TAirtelRefundMoneyRequest): Promise<TAirtelRefundMoneyResponse>;
    getTransactionEnquiry(deps:TAirtelTransactionEnquiryRequest): Promise<TAirtelTransactionEnquiryResponse>;
    logFailedIncomingTransfer(req: TAirtelDisbursementRequestBody): Promise<void>;
    logFailedRefund(airtel_money_id: string): Promise<void>;
}


