import { IHTTPClient, ILogger, THttpResponse } from '../interfaces';
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

export type TMTNClientFactoryDeps = {
    mtnConfig: TMTNConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
}

export type TMTNConfig = {
    FSP_ID:string
    MTN_BASE_URL: string;
    MTN_CLIENT_ID: string;
    SERVICE_CHARGE: string;
    EXPIRATION_DURATION: string;
    MTN_SUBSCRIPTION_KEY: string;
    MTN_TARGET_ENVIRONMENT: string;
    MTN_ENCODED_CREDENTIALS: string;
    TRANSACTION_ENQUIRY_WAIT_TIME: number
    SUPPORTED_ID_TYPE: components["schemas"]["PartyIdType"];

}


export type TGetTokenResponse = {
    "access_token": string;
    "token_type": string;
    "expires_in": number
}


export type TGetKycArgs = {
 "msisdn" : string;
}

export type TMTNKycResponse = {
    "given_name": string;
    "family_name": string;
    "birthdate": string;
    "locale": string;
    "gender": string;
    "status": string;
}


export type TMTNDisbursementRequestBody = {
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


export type TMTNDisbursementResponse = {
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


export type TMTNSendMoneyResponse = {
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


export type TMTNSendMoneyRequest = {
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

export type TMTNCollectMoneyRequest = {
    "amount": string;
    "currency": string;
    "externalId": string;
    "payer": {
        "partyIdType": "MSISDN",
        "partyId": string;
    },
    "payerMessage": string;
    "payeeNote": string;
}


export type TMTNCollectMoneyResponse = {
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


export type TGetCustomerInfoDeps = {
    property: string
}

export type TGetCustomerResponse = {
    property: string
}

export type TCbsSendMoneyRequest = {
    // define this to fit dfsp's needs
    property: string
}

export type TCbsSendMoneyResponse = {
    // define this to fit dfsp's needs
    property: string
}


export type TCBSUpdateSendMoneyRequest = {
    property: string
}

export interface IMTNClient{

    mtnConfig: TMTNConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
    getKyc(deps: TGetKycArgs): Promise<TMTNKycResponse>;
    getToken(): Promise<TGetTokenResponse>;
    getCustomer(deps: TGetCustomerInfoDeps):Promise<THttpResponse<TGetCustomerResponse>>
}