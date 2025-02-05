import { IHTTPClient, ILogger} from '../interfaces';
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

export type TCBSClientFactoryDeps = {
    cbsConfig: TCBSConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
}

export type TGetCustomerInfoDeps = unknown;

export type TGetCustomerResponse = unknown;

export interface ICbsClient {
    cbsConfig: TCBSConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
}


export type TCBSConfig = {
    CBS_NAME: string;
    DFSP_BASE_URL: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    GRANT_TYPE: string;
    X_COUNTRY: string;
    X_CURRENCY: components["schemas"]["Currency"];
    SUPPORTED_ID_TYPE: components["schemas"]["PartyIdType"];
    SENDING_SERVICE_CHARGE: number;
    RECEIVING_SERVICE_CHARGE: number;
    EXPIRATION_DURATION: string;
    AIRTEL_PIN: string;
    FSP_ID:string;
    LEI: string;
}

export type TMTNClientFactoryDeps = {
    mtnConfig: TMTNConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
}

export type TMTNConfig = {
    FSP_ID: string;
    X_COUNTRY: string;
    X_CURRENCY: components["schemas"]["Currency"];
    MTN_COLLECTION_API_KEY: string;
    MTN_COLLECTION_CLIENT_ID: string;
    MTN_COLLECTION_SUBSCRIPTION_KEY: string;
    MTN_DISBURSEMENT_API_KEY: string;
    MTN_DISBURSEMENT_CLIENT_ID: string;
    MTN_DISBURSEMENT_SUBSCRIPTION_KEY: string;
    MTN_BASE_URL: string;
    SERVICE_CHARGE: string;
    EXPIRATION_DURATION: string;
    MTN_TARGET_ENVIRONMENT: string;
    TRANSACTION_ENQUIRY_WAIT_TIME: number;
    SUPPORTED_ID_TYPE: components["schemas"]["PartyIdType"];
    MTN_ENV: string;
    LEI: string;
    DFSP_CURRENCY:components["schemas"]["Currency"];

}



export type TGetTokenResponse = {
    "access_token": string;
    "token_type": string;
    "expires_in": number
}


export type TGetTokenRequest = unknown

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
    "payerMessage": string;
    "payeeNote": string;
}


export type TMTNUpdateMerchantPaymentRequest = TMTNUpdateSendMoneyRequest;

export type TMTNSendMoneyRequest = {
    "homeTransactionId": string;
    "payeeId": string;
    "payeeIdType": components["schemas"]["PartyIdType"];
    "sendAmount": string;  "amountType": "RECEIVE" | "SEND",
    "sendCurrency": components['schemas']['Currency'];
    "receiveCurrency": string;
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
        };
    };
}


export type TMTNMerchantPaymentRequest = TMTNSendMoneyRequest

export type TMTNMerchantPaymentResponse = TMTNSendMoneyResponse


export type TMTNCallbackPayload = {
    financialTransactionId: string;
    externalId: string;
    amount: string;
    currency: string;
    payee:{
        partyIdType: string;
        partyId: string;
    },
    payeeNote: string;
    status: string;
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
    "homeTransactionId": string;
}

export type TMTNCollectMoneyRequest = {
    "amount": string;
    "currency": string;
    "amountType": "RECEIVE" | "SEND",
    "externalId": string;
    "payer": {
        "partyIdType": string,
        "partyId": string;
    },
    "payerMessage": string;
    "payeeNote": string;
}

export type TAuthParameters = {
    subscriptionKey: string;
    apiKey: string;
    apiClient: string;
    tokenUrl: string;
}

export interface IMTNClient{
    mtnConfig: TMTNConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
    getToken(deps: TAuthParameters): Promise<TGetTokenResponse>;
    getKyc(deps: TGetKycArgs): Promise<TMTNKycResponse>;
    collectMoney(deps: TMTNCollectMoneyRequest): Promise<void>;
    sendMoney(deps: TMTNDisbursementRequestBody): Promise<void>;
    getCollectionTransactionEnquiry(deps: TMTNTransactionEnquiryRequest): Promise<TMTNTransactionEnquiryResponse>;
    getDisbursementTransactionEnquiry(deps: TMTNTransactionEnquiryRequest): Promise<TMTNTransactionEnquiryResponse>;
    logFailedIncomingTransfer(req: TMTNDisbursementRequestBody): Promise<void>;
    logFailedRefund(transaction_id: string): Promise<void>;
}