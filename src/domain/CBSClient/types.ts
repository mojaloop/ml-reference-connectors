import { IHTTPClient, ILogger, Party, TPayeeExtensionListEntry, TQuoteRequest, TQuoteResponse, TtransferPatchNotificationRequest, TtransferRequest, TtransferResponse } from '../interfaces';
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

export type TCBSClientFactoryDeps<C> = {
    cbsConfig: TCBSConfig<C>;
    httpClient: IHTTPClient;
    logger: ILogger;
}

export type TCBSConfig<C> = {
    FSP_ID: string
    LEI: string;
    CURRENCY: components["schemas"]["Currency"];
    SUPPORTED_ID_TYPE: components["schemas"]["PartyIdType"];
    config: C
}


export type TCbsSendMoneyRequest = {
    homeTransactionId?: string;
    payeeId: string;
    payeeIdType: components["schemas"]["PartyIdType"];
    sendAmount: string;
    sendCurrency: components['schemas']['Currency'];
    receiveCurrency: components['schemas']['Currency'];
    purposeCode: string;
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

export type TCbsMerchantPaymentRequest = {
    homeTransactionId?: string;
    payeeId: string;
    payeeIdType: components["schemas"]["PartyIdType"];
    sendCurrency: components['schemas']['Currency'];
    receiveAmount: string;
    receiveCurrency: components['schemas']['Currency'];
    purposeCode: string;
    transactionType: components['schemas']['transferTransactionType'];
    payer: {
        name: string;
        payerId: string;
        DateAndPlaceOfBirth: {
            BirthDt: string;
            PrvcOfBirth: string;
            CityOfBirth: string;
            CtryOfBirth: string;
        }
    }
}

export type TCbsSendMoneyResponse = {
    "payeeDetails": {
        "idType": string;
        "idValue": string;
        "fspId": string;
        "fspLEI": string;
        "name": string;
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

export type TMerchantPaymentResponse = TCbsSendMoneyResponse;

export type TCBSUpdateSendMoneyRequest = {
    "acceptQuote": boolean;
    "homeTransactionId": string;
}

export type TCBSUpdateSendMoneyResponse = {
    "transferId": string;
}

export type TGetKycArgs = {
    accountId: string;

}

export interface ICbsClient<C> {
    logger: ILogger;
    getAccountInfo(deps: TGetKycArgs): Promise<Party>;
    getAccountDiscoveryExtensionLists(): TPayeeExtensionListEntry[];
    getQuote(quoteRequest: TQuoteRequest): Promise<TQuoteResponse>;
    reserveFunds(transfer: TtransferRequest): Promise<TtransferResponse>;
    commitReservedFunds(transferUpdate: TtransferPatchNotificationRequest): Promise<void>;
    handleRefund(updateSendMoneyDeps: TCBSUpdateSendMoneyRequest, transferId: string): Promise<void>;
}