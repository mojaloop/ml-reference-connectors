import { TSDKOutboundTransferResponse, TtransferContinuationResponse, TUpdateTransferDeps } from '../src/domain/SDKClient';
import {TNMCallbackPayload, TNMSendMoneyRequest, TNMUpdateSendMoneyRequest, } from '../src/domain/CBSClient';
import * as crypto from 'node:crypto';
import { TtransferPatchNotificationRequest, TQuoteRequest, TtransferRequest, THttpResponse } from 'src/domain/interfaces/types';
import { components } from '@mojaloop/api-snippets/lib/sdk-scheme-adapter/v2_1_0/outbound/openapi';

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

export const fineractCalculateWithdrawQuoteResponseDto = (feeAmount: number) => feeAmount;


export const transferPatchNotificationRequestDto = (currentState: string, partyIdType: string, partyIdentifier: string, amount: string): TtransferPatchNotificationRequest => ({
  //@ts-expect-error currentState var to of type
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
          //@ts-expect-error partyIdType var not of type IdType
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
      amount: {
        amount: amount,
        currency: "MWK"
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


export const quoteRequestDto = (idType: string = "MSISDN", idValue: string = "0881544547", amount: string = "1"): TQuoteRequest => ({
  amount: amount,
  amountType: "SEND",

  currency: "MWK",
  from: {
    idType: "MSISDN",
    idValue: "978034884"
  },
  initiator: "PAYER",
  initiatorType: "CONSUMER",
  quoteId: crypto.randomUUID(),
  to: {
    //@ts-expect-error partyIdType var not of type IdType
    idType: idType,
    idValue: idValue
  },
  transactionId: crypto.randomUUID(),
  transactionType: "TRANSFER"
});


export const transferRequestDto = (idType: string, idValue: string, amount: string): TtransferRequest => ({
  amount: amount,
  amountType: "SEND",
  currency: "MWK",
  from: {
    //@ts-expect-error partyIdType var not of type IdType
    idType: idType,
    idValue: idValue
  },
  to: {
    //@ts-expect-error partyIdType var not of type IdType
    idType: idType,
    idValue: idValue
  },
  ilpPacket: {
    data: {
      amount: {
        amount: amount,
        currency: "MWK",
      },
      payee: {
        partyIdInfo: {
          //@ts-expect-error partyIdType var not of type IdType
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
        supportedCurrencies: ["MWK"],
      },
      payer: {
        //@ts-expect-error partyIdType var not of type IdType
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

export const sendMoneyDTO = (idValue: string, amount: string,): TNMSendMoneyRequest => ({
  "homeTransactionId": "HTX123456789",
  "payeeId": "07676767676",
  "payeeIdType": "MSISDN",
  "sendAmount": amount,
  "sendCurrency": "MWK",
  "receiveCurrency": "MWK",
  "transactionDescription": "Payment for services",
  "transactionType": "TRANSFER",
  "payer": "Elikah Okello",
  "payerAccount": idValue,
  "dateOfBirth": "1985-04-12"
});


export const updateSendMoneyDTO = (amount: number, acceptQuote: boolean, idValue: string): TNMUpdateSendMoneyRequest => ({
  "acceptQuote": acceptQuote,
  "msisdn": idValue,
  "amount": amount.toString(),
  "narration": "Payment for test"
});


export const sdkInitiateTransferResponseDto = (idValue: string, currentState: components["schemas"]["transferStatus"]): THttpResponse<TSDKOutboundTransferResponse> => ({
  statusCode: 200,
  data: {
    homeTransactionId: crypto.randomUUID(),
    from: {
      idType: "MSISDN",
      idValue: idValue
    },
    to: {
      idType: "MSISDN",
      idValue: idValue
    },
    amountType: "SEND",
    currency: "MWK",
    amount: "1000",
    transactionType: "TRANSFER",
    currentState: currentState,
    transferId: crypto.randomUUID()
  }
});

export const sdkUpdateTransferResponseDto = (idValue: string, amount: string): THttpResponse<TtransferContinuationResponse> => ({
  statusCode: 200,
  data: {
    homeTransactionId: crypto.randomUUID(),
    from: {
      idType: "MSISDN",
      idValue: idValue
    },
    to: {
      idType: "MSISDN",
      idValue: idValue
    },
    amountType: "SEND",
    amount: amount,
    currency: "MWK",
    transactionType: "TRANSFER",
  }
});

export const tnmUpdateSendMoneyRequestDto = (idValue: string, amount: string): TNMUpdateSendMoneyRequest => ({
  "acceptQuote": true,
  "msisdn": idValue,
  "amount": amount,
  "narration": "Test Payment"
});

export const TNMCallbackPayloadDto = ():TNMCallbackPayload => ({
  receipt_number: crypto.randomUUID(),
  result_description: "Completed Successfully",
  result_code: "0",
  result_time: new Date().toDateString(), //Datetime
  transaction_id: crypto.randomUUID(),
  success: true 
});
