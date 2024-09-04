import { IHTTPClient, ILogger, THttpResponse } from '../interfaces';
import { components } from '@mojaloop/api-snippets/lib/sdk-scheme-adapter/v2_1_0/outbound/openapi';
export declare enum IdType {
    MSISDN = "MSISDN",
    IBAN = "IBAN",
    ACCOUNT_NO = "ACCOUNT_NO",
    EMAIL = "EMAIL",
    PERSONAL_ID = "PERSONAL_ID",
    BUSINESS = "BUSINESS",
    DEVICE = "DEVICE",
    ACCOUNT_ID = "ACCOUNT_ID",
    ALIAS = "ALIAS"
}
export declare enum PartyType {
    CONSUMER = "CONSUMER",
    AGENT = "AGENT",
    BUSINESS = "BUSINESS",
    DEVICE = "DEVICE"
}
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
export declare enum FineractLookupStage {
    SEARCH = "search",
    SAVINGSACCOUNT = "savingsaccount",
    CLIENT = "client"
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
export type TZicbConfig = {
    ZICB_BASE_URL: string;
    ZICB_AUTH_KEY: string;
    SUPPORTED_ID_TYPE: components["schemas"]["PartyIdType"];
    SERVICE_REQUEST: string;
    ZICB_CURRENCY: string;
    SERVICE_CHARGE: string;
    EXPIRATION_DURATION: string;
    ZICB_DESTINATION_BRANCH: string;
    ZICB_SOURCE_BRANCH: string;
    DFSP_DISBURSEMENT_ACCOUNT: string;
    DFSP_COLLECTION_ACCOUNT: string;
};
export type TZicbClientFactoryDeps = {
    zicbConfig: TZicbConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
};
export type TGetCustomerRequest = {
    "service": string;
    "request": {
        "accountNos": string;
        "customerNos"?: string;
        "getByCustNo": boolean;
        "getByAccType": boolean;
        "accountType"?: string;
    };
};
export type TGetCustomerResponse = {
    "errorList": {};
    "operation_status": string;
    "preauthUUID": string;
    "request": {
        "accountNos": string;
        "accountType"?: string;
        "customerNos"?: string;
        "getByAccType": boolean;
        "getByCustNo": boolean;
    };
    "request-reference": string;
    "response": {
        "accountList": [
            {
                "frozenStatus": frozenStatusTypes;
                "accDesc": string;
                "loanStatus"?: string;
                "accTypeDesc": string;
                "accOpeningDate"?: string;
                "loanMaturityDate"?: string;
                "chequeBookFlag": string;
                "lastCreditActivity"?: string;
                "loanRate"?: string;
                "overdftUtilizedAmt": number;
                "accATMFacility"?: string;
                "overdftAllowed": string;
                "loanLastPaidDate"?: string;
                "maturityAmount"?: string;
                "accPassBookFacility"?: string;
                "currency": string;
                "loanNextDueDate"?: string;
                "creditAccountOnMaturity"?: string;
                "loanAmountFinanced"?: string;
                "loanAmountDisbursed"?: string;
                "userLcRef"?: string;
                "expiryDate"?: string;
                "loanTotalAmountDue"?: string;
                "overdftLmt": number;
                "loanEMI": number;
                "loanAmountDue": number;
                "loanAmount": number;
                "address2": string;
                "dealRef": string;
                "loanType"?: string;
                "dealType"?: string;
                "actualAmount": number;
                "loanTotalAmountPaid": number;
                "address4": string;
                "accStatus": string;
                "accountOpenDate": number;
                "address3": string;
                "overdftAvailableAmt"?: string;
                "loanStartDate": string;
                "coreBankingDate": string;
                "accNo": string;
                "lastDebitActivity"?: string;
                "customerName"?: string;
                "curBal": number;
                "issueDate"?: string;
                "loanTenure": number;
                "jointAccount": string;
                "accType": string;
                "closureDate"?: string;
                "address1": string;
                "accName"?: string;
                "branchCode": string;
                "prodCode": string;
                "totalAmountAvailable": number;
                "avlBal": number;
                "idCustomer": string;
                "loanAmountOverdue"?: string;
                "unclearFunds": number;
            }
        ];
        "tekHeader": {
            "errList": {};
            "hostrefno"?: string;
            "msgList": {};
            "status": string;
            "tekesbrefno": string;
            "username": string;
            "warnList": {};
        };
    };
    "status": number;
    "timestamp": number;
};
export declare enum frozenStatusTypes {
    A = "A",
    N = "N"
}
export type TInternalFundsTransferRequest = {
    "service": string;
    "request": {
        "amount": string;
        "destAcc": string;
        "destBranch": string;
        "payCurrency": string;
        "payDate": string;
        "referenceNo": string;
        "remarks": string;
        "srcAcc": string;
        "srcBranch": string;
        "srcCurrency": string;
        "transferTyp": string;
    };
};
export type TInternalFundsTransferResponse = {
    "errorList": {
        "AC-VAC05": string;
        "ST-SAVE-054": string;
        "UP-PMT-90": string;
    };
    "operation_status": string;
    "preauthUUID": string;
    "request": {
        "amount": string;
        "destAcc": string;
        "destBranch": string;
        "payCurrency": string;
        "payDate": string;
        "referenceNo": string;
        "remarks": string;
        "srcAcc": string;
        "srcBranch": string;
        "srcCurrency": string;
        "transferTyp": string;
    };
    "request-reference": string;
    "response": {
        "amountCredit"?: string;
        "amountDebit"?: string;
        "destAcc"?: string;
        "destBranch"?: string;
        "exchangeRate"?: string;
        "payCurrency"?: string;
        "payDate"?: string;
        "srcAcc"?: string;
        "srcBranch"?: string;
        "srcCurrency"?: string;
        "tekHeader": {
            "errList": {
                "AC-VAC05": string;
                "ST-SAVE-054": string;
                "UP-PMT-90": string;
            };
            "hostrefno"?: string;
            "msgList": {};
            "status"?: string;
            "tekesbrefno"?: string;
            "username"?: string;
            "warnList": {};
        };
    };
    "status": number;
    "timestamp": number;
};
export interface IZicbClient {
    zicbConfig: TZicbConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
    verifyCustomerByAccountNumber(deps: TGetCustomerRequest): Promise<TGetCustomerResponse>;
    walletToWalletInternalFundsTransfer(deps: TInternalFundsTransferRequest): Promise<TInternalFundsTransferResponse>;
}
