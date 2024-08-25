import { TUpdateTransferDeps } from '../src/domain/SDKClient';
import { IdType, TAirtelSendMoneyRequest, TAirtelUpdateSendMoneyRequest, TFineractGetAccountResponse, TFineractTransactionResponse } from '../src/domain/CBSClient';
import * as crypto from 'node:crypto';
import { TtransferPatchNotificationRequest, TQuoteRequest, TtransferRequest } from 'src/domain/interfaces/types';

type TransferAcceptInputDto = {
    fineractAccountId?: number;
    totalAmount?: number;
    sdkTransferId?: number;
};


export const transferAcceptDto = ({
    fineractAccountId = 1,
    totalAmount = 123.45,
    sdkTransferId = 999,
}: TransferAcceptInputDto = {}): TUpdateTransferDeps =>
    ({
        fineractTransaction: {
            fineractAccountId,
            totalAmount,
            routingCode: 'routingCode',
            receiptNumber: 'receiptNumber',
            bankNumber: 'bankNumber',
        },
        sdkTransferId,
    }) as const;

// todo: make it configurable, add all required fields
export const fineractGetAccountResponseDto = (): Partial<TFineractGetAccountResponse> =>
    ({
        id: 'id',
        accountNo: 'accountNo',
        clientId: 123,
        clientName: 'clientName',
    }) as const;

// todo: make it configurable,
export const fineractTransactionResponseDto = (): TFineractTransactionResponse =>
    ({
        officeId: 1,
        clientId: 2,
        savingsId: 3,
        resourceId: 4,
        changes: {
            accountNumber: 'accountNumber',
            routingCode: 'routingCode',
            receiptNumber: 'receiptNumber',
            bankNumber: 'bankNumber',
        },
    }) as const;

export const fineractLookUpPartyResponseDto = () =>
    ({
        displayName: 'Dove Love',
        firstname: 'Dove',
        lastname: 'Love',
    }) as const;

export const fineractVerifyBeneficiaryResponseDto = () =>
    ({
        currency: 'UGX',
        amount: '100',
        quoteId: crypto.randomUUID(),
        transactionId: crypto.randomUUID(),
    }) as const;

export const fineractGetAccountIdResponseDto = () => ({
    accountId: 1,
});

export const fineractReceiveTransferResponseDto = () => true;

export const fineractGetSavingsAccountResponseDto = (
    credit: boolean,
    debit: boolean,
    balance: number,
    active: boolean,
) => ({
    status: {
        active: active,
    },
    subStatus: {
        blockCredit: credit,
        blockDebit: debit,
    },
    summary: {
        availableBalance: balance,
    },
});

export const sdkInitiateTransferResponseDto = (
    payeeFspCommissionAmount: string | undefined,
    payeeFspFeeAmount: string | undefined,
) => ({
    quoteResponse: {
        body: {
            payeeFspCommission: {
                amount: payeeFspCommissionAmount,
            },
            payeeFspFee: {
                amount: payeeFspFeeAmount,
            },
        },
    },
});

export const fineractCalculateWithdrawQuoteResponseDto = (feeAmount: number) => feeAmount;


export const transferPatchNotificationRequestDto= (currentState: string, partyIdType:string, partyIdentifier:string, amount:string): TtransferPatchNotificationRequest =>({
  //@ts-ignore
  currentState: currentState,  
  direction: "INBOUND",
  finalNotification: {
    completedTimestamp: "6966-12-29T00:03:24.449Z", 
    extensionList: [
      {
        key: "string",
        value: "string"
      }
    ],
    transferState: "RECEIVED" 
  },
  fulfil: {
    body: {},
    headers: {}
  },
  initiatedTimestamp: "1197-12-29T23:21:38.743Z", 
  lastError: {
    httpStatusCode: 0, 
    mojaloopError: {
      errorInformation: {
        errorCode: "5100", 
        errorDescription: "string",
        extensionList: {
          extension: [
            {
              key: "string",
              value: "string"
            }
          ]
        }
      }
    }
  },
  prepare: {
    body: {},
    headers: {}
  },
  quote: {
    fulfilment: "string",
    internalRequest: {},
    mojaloopResponse: {},
    request: {},
    response: {}
  },
  quoteRequest: {
    body: {
      quoteId: '',
      transactionId: '47e8a9cd-3d89-55c5-a15a-b57a28ad763e',
      payee: {
        partyIdInfo: {
          //@ts-ignore
          partyIdType: partyIdType,
          partyIdentifier: partyIdentifier,
          partySubIdOrType: undefined,
          fspId: undefined,
          extensionList: undefined
        },
        merchantClassificationCode: undefined,
        name: undefined,
        personalInfo: undefined,
        supportedCurrencies: undefined
      },
      payer: {
        partyIdInfo: {
          partyIdType: 'MSISDN',
          partyIdentifier: '978980797',
          partySubIdOrType: undefined,
          fspId: undefined,
          extensionList: undefined
        },
        merchantClassificationCode: undefined,
        name: undefined,
        personalInfo: undefined,
        supportedCurrencies: undefined
      },
      amountType: 'SEND',
      amount:{
        amount: amount,
        currency :"ZMW"
      },
      transactionType: { 
        scenario: 'TRANSFER',
        subScenario: undefined,
        initiator: 'PAYER',
        initiatorType: 'BUSINESS',
        refundInfo: undefined,
        balanceOfPayments: undefined
      }
    },
    headers: {}
  },
  quoteResponse: {
    body: {},
    headers: {}
  },
  transferId: "47e8a9cd-3d89-55c5-a15a-b57a28ad763e"
});


export const quoteRequestDto =(idType: string = "MSISDN", idValue: string = "978980797", amount: string = "100"): TQuoteRequest => ({
  amount: amount,
  amountType: "SEND",

  currency: "ZMW",
  from: {
    idType: "MSISDN",
    idValue: "978034884"
  },
  initiator: "PAYER",
  initiatorType: "CONSUMER",
  quoteId: crypto.randomUUID(),
  to: {
    //@ts-ignore
    idType: idType,
    idValue: idValue
  },
  transactionId: crypto.randomUUID(),
  transactionType: "TRANSFER"
});


export const transferRequestDto = (idType: string, idValue: string, amount: string): TtransferRequest => ({
amount: amount,
amountType: "SEND",
currency: "ZMW",
from: {
  //@ts-ignore
  idType: idType,
  idValue: idValue
},
ilpPacket: {
  data: {
    amount: {
      amount: amount,
      currency: "ZMW",
    },
    payee: {
      partyIdInfo: {
        //@ts-ignore
        partyIdType: idType,
        partyIdentifier: idValue,
        fspId: "airtel-123-qwerty",
      },
      merchantClassificationCode: "1234",
      name: "Payee Name",
      personalInfo: {
        complexName: {
          firstName: "PayeeFirstName", 
          lastName: "PayeeLastName",  
        },
        dateOfBirth: "YYYY-MM-DD", 
      },
      supportedCurrencies: ["ZMW"],
    },
    payer: {
      //@ts-ignore
      idType: idType,
      idValue: idValue
    },
    quoteId: crypto.randomUUID(), 
    transactionId: crypto.randomUUID(),
    transactionType: {
      initiator: "PAYER",
      initiatorType: "CONSUMER",
      scenario: "TRANSFER",
      subScenario: "LOCALLY_DEFINED_SUBSCENARIO",
    },
  },
},
note: "Transfer Quote Request",
});


// Send Money DTO

export const sendMoneyDTO =(idValue:string, amount:string,): TAirtelSendMoneyRequest => ( {
  "homeTransactionId": "HTX123456789",
  "payeeId": "07676767676",
  "payeeIdType": "MSISDN",
  "sendAmount": amount,
  "sendCurrency": "ZMW",
  "receiveCurrency": "ZMW",
  "transactionDescription": "Payment for services",
  "transactionType":"TRANSFER",
  "payer": "Elikah Okello",
  "payerAccount": idValue,
  "dateOfBirth": "1985-04-12"
});


export const updateSendMoneyDTO =(amount:number, acceptQuote:boolean, idValue:string) :TAirtelUpdateSendMoneyRequest =>({
  "acceptQuote": acceptQuote,
  "msisdn": idValue,
  "amount": amount
});