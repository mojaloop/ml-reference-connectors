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

export type TCBSClientFactoryDeps = {
    cbsConfig: TCBSConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
}

export type TCBSConfig = {
    CBS_NAME: string;
    AIRTEL_BASE_URL: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    GRANT_TYPE: string;
    X_COUNTRY: string;
    X_CURRENCY: string;
    SUPPORTED_ID_TYPE: components["schemas"]["PartyIdType"];
    SERVICE_CHARGE: string;
    EXPIRATION_DURATION: string;
    AIRTEL_PIN: string;
    TRANSACTION_ENQUIRY_WAIT_TIME: number
    FSP_ID:string
}


export type TCbsSendMoneyRequest = {
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

export type TCbsSendMoneyResponse = {
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


export type TCBSUpdateSendMoneyRequest = {
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
    msisdn: string;

}

export type TCbsKycResponse = {
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

export type TGetTokenArgs = {
    client_id: string;
    client_secret: string;
    grant_type: string;
}

export type TGetTokenResponse = {
    "access_token": string;
    "expires_in": string;
    "token_type": string
}

export type TCbsDisbursementRequestBody = {
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

export type TCbsDisbursementResponse = {
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

export type TCbsCollectMoneyRequest = {
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

export type TCbsCollectMoneyResponse = {
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

export type TCbsRefundMoneyRequest = {
    "transaction": {
        "airtel_money_id": string;
    }
}

export type TCbsRefundMoneyResponse = {
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

export interface ICbsClient {
    cbsConfig: TCBSConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
    getKyc(deps: TGetKycArgs): Promise<TCbsKycResponse>;
    getToken(deps: TGetTokenArgs): Promise<TGetTokenResponse>;
    sendMoney(deps: TCbsDisbursementRequestBody): Promise<TCbsDisbursementResponse>;
    collectMoney(deps: TCbsCollectMoneyRequest): Promise<TCbsCollectMoneyResponse>;
    refundMoney(deps: TCbsRefundMoneyRequest): Promise<TCbsRefundMoneyResponse>;
}