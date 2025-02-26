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

export type TNBMClientFactoryDeps = {
    NBMConfig: TNBMConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
}

export type TNBMConfig = {
    NBM_NAME: string;
    DFSP_BASE_URL: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    SUPPORTED_ID_TYPE: components["schemas"]["PartyIdType"];
    SENDING_SERVICE_CHARGE: number;
    CURRENCY: components["schemas"]["Currency"];
    COUNTRY: string;
    RECEIVING_SERVICE_CHARGE: number;
    EXPIRATION_DURATION: string;
    FSP_ID:string;
    LEI: string
}


export type TNBMSendMoneyRequest = {
    homeTransactionId: string;
    payeeId: string;
    payeeIdType: components["schemas"]["PartyIdType"];
    sendAmount: string;
    sendCurrency: components['schemas']['Currency'];
    receiveCurrency: components['schemas']['Currency'];
    transactionDescription: string;
    transactionType: components['schemas']['transferTransactionType'];
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



export type TNBMSendMoneyResponse = {
    "payeeDetails": {
        "idType": string;
        "idValue": string;
        "fspId": string;
        "firstName": string;
        "lastName": string;
        "dateOfBirth": string;
    },
    "receiveAmount": string;
    "receiveCurrency": string;
    "fees": string;
    "feeCurrency": string;
    "transactionId": string;
}


export type TNBMUpdateSendMoneyRequest = {
    "acceptQuote": boolean;
    
}

export type TNBMInvoiceRequest = {
    invoice_number: string;
};




export type TGetKycArgs = {
    account_number: string;
}

export type TNBMKycResponse = {
    "data": {
        "account_number": string;
        "customer_number": string;
        "category": string;
        "branch": string;
        "currency": string;
        "locked_amount": string;
        "limit_amound": string;
    };
    "message": string
}
3;
export type TGetTokenArgs = {
    clientId: string;
    clientSecret: string;
}

export type TGetTokenResponse = {
    "access_token": string;
    "expires_in": string;
}

export type TNBMTransferMoneyRequest = { 
    "amount": string,
    "description": string,
    "reference": string,
    "credit_account": string
    "currency": string
}

export type TNBMTransferMoneyResponse = {
    "message": string,
    "data": {
        "reference": string,
}
}





export type TNBMTransactionResponse = {
    success: boolean;
    message: string;
    transactionId: string;
    debitAccountId: string;
    creditAccountId: string;
    amount: number;
    status: "debited" | "credited";
    timestamp: string;
  };


export interface INBMClient {
    NBMConfig: TNBMConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
    getKyc(deps: TGetKycArgs): Promise<TNBMKycResponse>;
    getToken(deps: TGetTokenArgs): Promise<TGetTokenResponse>;
    makeTransfer(deps: TNBMTransferMoneyRequest): Promise<TNBMTransferMoneyResponse>;
    sendMoney(deps: TNBMTransferMoneyRequest): Promise<TNBMTransferMoneyResponse>;
    refundMoney(deps: TNBMTransferMoneyRequest): Promise<TNBMTransferMoneyResponse>;
}