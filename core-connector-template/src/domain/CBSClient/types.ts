import { IHTTPClient, ILogger, THttpResponse } from '../interfaces';

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

export type TCBSClientFactoryDeps = {
    cbsConfig: TCBSConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
}

export type TCBSConfig = {
    CBS_NAME: string;

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

export interface ICbsClient{
    getCustomer(deps: TGetCustomerInfoDeps):Promise<TGetCustomerResponse>
}