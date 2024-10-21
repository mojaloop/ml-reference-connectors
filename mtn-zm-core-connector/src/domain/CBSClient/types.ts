import { Config } from 'convict';
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

export enum PartyType {
    CONSUMER = 'CONSUMER',
    AGENT = 'AGENT',
    BUSINESS = 'BUSINESS',
    DEVICE = 'DEVICE',
}

export type TMTNClientFactoryDeps = {
    mtnConfig: TMTNConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
}

export type TMTNConfig = {
    FSP_ID: string;
    X_COUNTRY: string;
    X_CURRENCY: string;
    MTN_API_KEY: string;
    MTN_BASE_URL: string;
    MTN_CLIENT_ID: string;
    SERVICE_CHARGE: string;
    EXPIRATION_DURATION: string;
    MTN_SUBSCRIPTION_KEY: string;
    MTN_TARGET_ENVIRONMENT: string;
    MTN_ENCODED_CREDENTIALS: string;
    TRANSACTION_ENQUIRY_WAIT_TIME: number;
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
    "amount": string,
    "currency": string,
    "externalId": string,
    "payee": {
        "partyIdType": string,
        "partyId": string,
    },
    "payerMessage": string,
    "payeeNote": string

}



export type TMTNTransactionEnquiryRequest = {
    "transactionId" : string;
}


export enum ETransactionStatus {
    PENDING = "PENDING",
    SUCCESSFUL = "SUCCESSFUL",
    FAILED = "FAILED",
}


export type TMTNTransactionEnquiryResponse = {
    "financialTransactionId": string;
    "externalId": string;
    "amount": string;
    "currency": string;
    "payer": {
        "partyIdType": string;
        "partyId": string;
    },
    "payerMessage": string;
    "payeeNote": string;
    "status": string;
}


export type TMTNCollectMoneyResponse = {
    "financialTransactionId":  string;
    "externalId":  string;
    "amount":  string;
    "currency": string;
    "payer": {
        "partyIdType": string;
        "partyId": string;
    },
    "payerMessage": "MoMo Market Payment",
    "payeeNote": "MoMo Market Payment",
    "status": string;
}


export type TMTNUpdateSendMoneyRequest = {
    "acceptQuote": boolean;
    "msisdn": string;
    "amount": string;
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


export type TMTNSendMoneyResponse ={
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


export interface IMTNClient{
    mtnConfig: TMTNConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
    getToken(): Promise<TGetTokenResponse>;
    getKyc(deps: TGetKycArgs): Promise<TMTNKycResponse>;
    collectMoney(deps: TMTNCollectMoneyRequest): Promise<TMTNCollectMoneyResponse>;
    sendMoney(deps: TMTNDisbursementRequestBody): Promise<void>;
    getCollectionTransactionEnquiry(deps: TMTNTransactionEnquiryRequest): Promise<TMTNTransactionEnquiryResponse>;
    getDisbursementTransactionEnquiry(deps: TMTNTransactionEnquiryRequest): Promise<TMTNTransactionEnquiryResponse>;

}