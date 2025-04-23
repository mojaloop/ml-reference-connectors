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


export type TZicbClientFactoryDeps = {
    zicbConfig: TZicbConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
}

export type TZicbConfig = {
    CBS_NAME: string;
    DFSP_BASE_URL: string;
    AUTH_KEY: string;
    X_COUNTRY: string;
    X_CURRENCY: components["schemas"]["Currency"];
    SUPPORTED_ID_TYPE: components["schemas"]["PartyIdType"];
    SENDING_SERVICE_CHARGE: number;
    RECEIVING_SERVICE_CHARGE: number;
    EXPIRATION_DURATION: string;
    FSP_ID: string
    LEI: string;
    DISBURSEMENT_ACCOUNT_NO: string;
    COLLECTION_ACCOUNT_NO: string;
    REQUEST_TIMEOUT: number;
}

// Request coming from Zicb to CC

export type TZicbSendMoneyRequest = {
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

export type TZicbMerchantPaymentRequest = {
    "homeTransactionId": string;
    "payeeId": string;
    "payeeIdType": components["schemas"]["PartyIdType"];
    "sendCurrency": components['schemas']['Currency'];
    "receiveAmount": string;
    "receiveCurrency": components['schemas']['Currency'];
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
        }
    }
}

// Response sent back to ZICB

export type TZicbSendMoneyResponse = {
    "payeeDetails": {
        "idType": string;
        "idValue": string;
        "fspId": string;
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
export type TZicbMerchantPaymentResponse = TZicbSendMoneyResponse;

export type TZicbUpdateSendMoneyRequest = {
    "acceptQuote": boolean;
    "accountNo": string;
    "amount": string;
    "payerMessage": string;
    "payeeNote": string;
}




// Zicb Base Request


type TZicbBaseRequest<TReq> = {
    service: string;
    request: TReq;
};

// Zicb Base Response

type TZicbBaseResponse<TReq, TRes> = {
    errorList: Record<string, unknown>;
    operation_status: string;
    preauthUUID: string;
    request: TReq;
    "request-reference": string;
    response: TRes;
    status: number;
    timestamp: number;
};


// TekHeader type in response

type TekHeader = {
    errList: Record<string, unknown>;
    hostrefno: null | string;
    msgList: Record<string, unknown>;
    status: string;
    tekesbrefno: string;
    username: string;
    warnList: Record<string, unknown>;
};


////// Customer KYC ///////////

type VerifyCustomerRequest = {
    accountNos: string;
    customerNos: string | null;
    getByCustNo: false;
    getByAccType: false;
    accountType: string | null;
}

//  Verify By Account Number Request

export type TVerifyCustomerByAccountNumberRequest = TZicbBaseRequest<VerifyCustomerRequest>;


// Account Type in TVerifyCustomerByAccountNumberResponse 

type Account = {
    frozenStatus: string;
    accDesc: string;
    loanStatus: null | number | string;
    accTypeDesc: string;
    accOpeningDate: null | number;
    loanMaturityDate: null | number;
    chequeBookFlag: string;
    lastCreditActivity: null | number;
    loanRate: null | number;
    overdftUtilizedAmt: number;
    accATMFacility: null | string;
    overdftAllowed: string;
    loanLastPaidDate: null | number;
    maturityAmount: null | number;
    accPassBookFacility: null | string;
    currency: string;
    loanNextDueDate: null | string;
    creditAccountOnMaturity: null | string;
    loanAmountFinanced: null | number;
    loanAmountDisbursed: null | number;
    userLcRef: null | string;
    expiryDate: null | number;
    loanTotalAmountDue: null | number;
    overdftLmt: number;
    loanEMI: number;
    loanAmountDue: number;
    loanAmount: number;
    address2: string;
    dealRef: string;
    loanType: null | string;
    dealType: null | string;
    actualAmount: number;
    loanTotalAmountPaid: number;
    address4: string;
    accStatus: string;
    accountOpenDate: number;
    address3: string;
    overdftAvailableAmt: null | number;
    loanStartDate: string;
    coreBankingDate: string;
    accNo: string;
    lastDebitActivity: null | number;
    customerName: null | string;
    curBal: number;
    issueDate: null | number;
    loanTenure: number;
    jointAccount: string;
    accType: string;
    closureDate: null | number;
    address1: string;
    accName: null | string;
    branchCode: string;
    prodCode: string;
    totalAmountAvailable: number;
    avlBal: number;
    idCustomer: string;
    loanAmountOverdue: null | number;
    unclearFunds: number;
};

type VerifyCustomerResponse = {
    accountList: Account[];
    tekHeader: TekHeader;
};

// Verify by Customer Response

export type TVerifyCustomerByAccountNumberResponse = TZicbBaseResponse<VerifyCustomerRequest, VerifyCustomerResponse>;



////// Customer KYC ///////////


// Wallet to Wallet Tranfer ///////

type WalletToWalletRequest = {
    amount: string;
    destAcc: string;
    destBranch: string;
    payCurrency: string;
    payDate: string;
    referenceNo: string;
    remarks: string;
    srcAcc: string;
    srcBranch: string;
    srcCurrency: string;
    transferTyp: string;
};


// Wallet to Wallet Transert request

export type TWalletToWalletInternalFundsTransferRequest = TZicbBaseRequest<WalletToWalletRequest>;

type WalletToWalletResponse = {
    amountCredit: null | string;
    amountDebit: null | string;
    destAcc: null | string;
    destBranch: null | string;
    exchangeRate: null | string;
    payCurrency: null | string;
    payDate: null | string;
    srcAcc: null | string;
    srcBranch: null | string;
    srcCurrency: null | string;
    tekHeader: TekHeader;
};

export type TWalletToWalletInternalFundsTransferResponse = TZicbBaseResponse<WalletToWalletRequest, WalletToWalletResponse>;


export interface IZicbClient {
    zicbConfig: TZicbConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
    verifyCustomerByAccountNumber(deps: TVerifyCustomerByAccountNumberRequest): Promise<TVerifyCustomerByAccountNumberResponse>;
    walletToWalletInternalFundsTransfer(deps: TWalletToWalletInternalFundsTransferRequest): Promise<TWalletToWalletInternalFundsTransferResponse>;
    logFailedIncomingTransfer(req: TWalletToWalletInternalFundsTransferRequest): Promise<void>;
    logFailedRefund(zicb_transfer_request: TWalletToWalletInternalFundsTransferRequest): Promise<void>;
}