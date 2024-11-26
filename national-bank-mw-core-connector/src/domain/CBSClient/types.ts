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
    GRANT_TYPE: string;
    X_COUNTRY: string;
    X_CURRENCY: components["schemas"]["Currency"];
    SUPPORTED_ID_TYPE: components["schemas"]["PartyIdType"];
    SENDING_SERVICE_CHARGE: number;
    RECEIVING_SERVICE_CHARGE: number;
    EXPIRATION_DURATION: string;
    AIRTEL_PIN: string;
    FSP_ID:string
}


export type TNBMSendMoneyRequest = {
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
    "msisdn": string;
    "amount": string;
}

export type TCallbackRequest = {
    "transaction": {
        "id": string;
        "message": string;
        "status_code": string;
        "airtel_money_id": string;
    }
}

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

export type TGetTokenArgs = {
    client_id: string;
    client_secret: string;
}

export type TGetTokenResponse = {
    "access_token": string;
    "expires_in": string;
}

export type TNBMDisbursementRequestBody = {
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

export type TNBMDisbursementResponse = {
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

export type TNBMCollectMoneyRequest = { 
    "amount": number,
    "description": string,
    "reference": string,
    "credit_account": string
    "currency": string
   
}

export type TNBMCollectMoneyResponse = {
    "message": string,
    "data": {
        "reference_": string,
}
}

export type TNBMRefundMoneyRequest = {
    "transaction": {
        "airtel_money_id": string;
    }
}

export type TNBMRefundMoneyResponse = {
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

//Mock Send Money Type
export type TNBMMockSendMoneyRequest ={

}

export interface INBMClient {
    NBMConfig: TNBMConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
    getKyc(deps: TGetKycArgs): Promise<TNBMKycResponse>;
    getToken(deps: TGetTokenArgs): Promise<TGetTokenResponse>;
    sendMoney(deps: TNBMDisbursementRequestBody): Promise<TNBMDisbursementResponse>;
    collectMoney(deps: TNBMCollectMoneyRequest): Promise<TNBMCollectMoneyResponse>;
    refundMoney(deps: TNBMRefundMoneyRequest): Promise<TNBMRefundMoneyResponse>;
    mockCollectMoney(debitAccountId: string, creditAccountId: string, amount: number): Promise<TNBMTransactionResponse>
}