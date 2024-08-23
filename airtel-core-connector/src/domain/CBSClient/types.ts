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

// maybe, we can remove prefix FINERACT_ from all fileds?
export type TFineractConfig = {
    FINERACT_BASE_URL: string;
    FINERACT_TENANT_ID: string;
    FINERACT_AUTH_MODE: string;
    FINERACT_USERNAME: string;
    FINERACT_PASSWORD: string;
    FINERACT_BANK_ID: string;
    FINERACT_ACCOUNT_PREFIX: string;
    FINERACT_BANK_COUNTRY_CODE: string;
    FINERACT_CHECK_DIGITS: string;
    FINERACT_ID_TYPE: IdType;
    FINERACT_LOCALE: string;
    FINERACT_PAYMENT_TYPE_ID: string;
};


export enum FineractLookupStage {
    SEARCH = 'search',
    SAVINGSACCOUNT = 'savingsaccount',
    CLIENT = 'client',
}

export type TLookupResponseInfo = {
    data: TFineractGetClientResponse;
    status: number;
    currency: string;
    accountId: number;
};

export type TAccountEntity = {
    entityId: number;
    entityAccountNo: string;
    entityName: string;
    entityType: string;
    parentId: number;
    parentName: string;
    entityStatus: unknown;
    parentType: string;
    subEntityType: string;
};

export type TFineractSearchResponse = TAccountEntity[];

export type TFineractAccountStatus = {
    id: number;
    code: string;
    value: string;
    submittedAndPendingApproval: boolean;
    approved: boolean;
    rejected: boolean;
    withdrawnByApplicant: boolean;
    active: boolean;
    closed: boolean;
    prematureClosed: boolean;
    transferInProgress: boolean;
    transferOnHold: boolean;
    matured: boolean;
};

// todo: are all fields required?
export type TFineractGetAccountResponse = {
    id: string;
    accountNo: string;
    depositType: unknown;
    clientId: number;
    clientName: string;
    savingsProductId: number;
    savingsProductName: string;
    fieldOfficerId: number;
    status: TFineractAccountStatus;
    subStatus: {
        id: number;
        code: string;
        value: string;
        none: boolean;
        inactive: boolean;
        dormant: boolean;
        escheat: boolean;
        block: boolean;
        blockCredit: boolean;
        blockDebit: boolean;
    };
    timeline: unknown;
    currency: {
        code: string;
        name: string;
        decimalPlaces: number;
        inMultiplesOf: number;
        nameCode: number;
        displayLabel: number;
    };
    nominalAnnualInterestRate: number;
    interestCompoundingPeriodType: unknown;
    interestPostingPeriodType: unknown;
    interestCalculationType: unknown;
    interestCalculationDaysInYearType: unknown;
    withdrawalFeeForTransfers: boolean;
    allowOverdraft: boolean;
    enforceMinRequiredBalance: boolean;
    withHoldTax: boolean;
    lastActiveTransactionDate: [];
    isDormancyTrackingActive: boolean;
    daysToInactive: number;
    daysToDormancy: number;
    daysToEscheat: number;
    summary: {
        currency: {
            code: string;
            name: string;
            decimalPlaces: number;
            displaySymbol: string;
            nameCode: string;
            displayLabel: string;
        };
        accountBalance: number;
        availableBalance: number;
    };
};

export type TFineractGetClientResponse = {
    id: number;
    accountNo: string;
    status: {
        id: number;
        code: string;
        value: string;
    };
    subStatus: {
        active: boolean;
        mandatory: boolean;
    };
    active: boolean;
    activationDate: [];
    firstname: string;
    lastname: string;
    displayName: string;
    gender: {
        active: boolean;
        mandatory: boolean;
    };
    clientType: {
        active: boolean;
        mandatory: boolean;
    };
    clientClassification: {
        active: boolean;
        mandatory: boolean;
    };
    isStaff: boolean;
    officeId: number;
    officeName: string;
    staffId: number;
    staffName: string;
    timeline: {
        submittedOnDate: [];
        submittedByUsername: string;
        submittedByFirstname: string;
        submittedByLastname: string;
        activatedOnDate: [];
        activatedByUsername: string;
        activatedByFirstname: string;
        activatedByLastname: string;
    };
    clientCollateralManagements: [];
    groups: [];
    clientNonPersonDetails: {
        constitution: {
            active: boolean;
            mandatory: boolean;
        };
        mainBusinessLine: {
            active: boolean;
            mandatory: boolean;
        };
    };
};

export interface IFineractClient {
    fineractConfig: TFineractConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
    lookupPartyInfo(accountNo: string): Promise<TLookupResponseInfo>;
    verifyBeneficiary(accountNo: string): Promise<TLookupResponseInfo>;
    receiveTransfer(transferDeps: TFineractTransferDeps): Promise<THttpResponse<TFineractTransactionResponse>>;
    getAccountId(accountNo: string): Promise<TLookupResponseInfo>;
    calculateWithdrawQuote(quoteDeps: TCalculateQuoteDeps): Promise<TCalculateQuoteResponse>;
    getSavingsAccount(accountId: number): Promise<THttpResponse<TFineractGetAccountResponse>>;
    sendTransfer(transactionPayload: TFineractTransferDeps): Promise<THttpResponse<TFineractTransactionResponse>>;
}

export type TFineractClientFactoryDeps = {
    fineractConfig: TFineractConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
};

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

export type TFineractTransactionPayload = {
    locale: string;
    dateFormat: string;
    transactionDate: string;
    transactionAmount: string;
    paymentTypeId: string;
    accountNumber: string;
    routingCode: string;
    receiptNumber: string;
    bankNumber: string;
};

export type TFineractTransferDeps = {
    accountId: number;
    transaction: TFineractTransactionPayload;
};

export type TFineractTransactionResponse = {
    officeId: number;
    clientId: number;
    savingsId: number;
    resourceId: number;
    changes: {
        accountNumber: string;
        routingCode: string;
        receiptNumber: string;
        bankNumber: string;
    };
};

export type TFineractCharge = {
    id: number;
    name: string;
    active: boolean;
    penalty: boolean;
    currency: {
        code: string;
        name: string;
        decimalPlaces: number;
        displaySymbol: string;
        nameCode: string;
        displayLabel: string;
    };
    amount: number;
    chargeTimeType: {
        id: number;
        code: string;
        value: string;
    };
    chargeAppliesTo: {
        id: number;
        code: string;
        value: string;
    };
    chargeCalculationType: {
        id: number;
        code: string;
        value: string;
    };
    chargePaymentMode: {
        id: number;
        code: string;
        value: string;
    };
};

export type TFineractGetChargeResponse = TFineractCharge[];

// Airtel Config

export type TAirtelConfig = {
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

export type TAirtelSendMoneyResponse = {
    "payeeDetails": string;
    "receiveAmount": string;
    "receiveCurrency": string;
    "fees": string;
    "feeCurrency": string;
    "transactionId": string;
}



export type TAirtelSendMoneyRequest = {
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


export type TAirtelUpdateSendMoneyRequest = {
    "acceptQuote": boolean;
    "msisdn": string;
    "amount": number;
}

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

export interface IAirtelClient {
    airtelConfig: TAirtelConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
    getKyc(deps: TGetKycArgs): Promise<TAirtelKycResponse>;
    getToken(deps: TGetTokenArgs): Promise<TGetTokenResponse>;
    sendMoney(deps: TAirtelDisbursementRequestBody): Promise<TAirtelDisbursementResponse>;
    collectMoney(deps: TAirtelCollectMoneyRequest): Promise<TAirtelCollectMoneyResponse>;
    refundMoney(deps: TAirtelRefundMoneyRequest): Promise<TAirtelRefundMoneyResponse>
}

