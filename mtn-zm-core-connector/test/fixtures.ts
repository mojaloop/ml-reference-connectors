import { TUpdateTransferDeps } from '../src/domain/SDKClient';
import { TMTNSendMoneyRequest, TMTNUpdateSendMoneyRequest } from '../src/domain/CBSClient';
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
          partyIdentifier: '56733123450',
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
        currency: "ZMW"
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
  transferId: crypto.randomUUID()
});


export const quoteRequestDto = (idType: string = "MSISDN", idValue: string = "56733123450", amount: string = "100"): TQuoteRequest => ({
  amount: amount,
  amountType: "SEND",

  currency: "EUR",
  from: {
    idType: "MSISDN",
    idValue: "56733123450"
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
  currency: "EUR",
  transferId: crypto.randomUUID(),
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
    "data": {
      "amount": {
        "amount": "400",
        "currency": "ZMW"
      },
      "payee": {
        "partyIdInfo": {
          "partyIdType": "MSISDN",
          "partyIdentifier": "0882997445",
          "fspId": "tnmmalawi"
        },
        "merchantClassificationCode": "1234",
        "name": "Payee Name",
        "personalInfo": {
          "complexName": {
            "firstName": "PayeeFirstName",
            "lastName": "PayeeLastName"
          },
          "dateOfBirth": "2001-08-21"
        },
      },
      "payer": {
        "partyIdInfo": {
          "partyIdType": "MSISDN",
          "partyIdentifier": "0882997445",
          "fspId": "tnmmalawi"
        },
        "merchantClassificationCode": "1234",
        "name": "Payee Name",
        "personalInfo": {
          "complexName": {
            "firstName": "PayeeFirstName",
            "lastName": "PayeeLastName"
          },
          "dateOfBirth": "2001-08-21"
        },
      },
      "quoteId": "2d93d09c-aa9f-411a-ba48-b315dd04d5d8",
      "transactionId": "25394f6a-aa14-46a2-b28a-35140e842f7d",
      "transactionType": {
        "initiator": "PAYER",
        "initiatorType": "CONSUMER",
        "scenario": "TRANSFER",
        "subScenario": "LOCALLY_DEFINED_SUBSCENARIO"
      }
    }
  },
  "transactionType": "TRANSFER",
  "quote": {
    "expiration": "2024-10-15T13:17:57.742Z",
    "payeeFspCommissionAmount": "0",
    "payeeFspCommissionAmountCurrency": "MWK",
    "payeeFspFeeAmount": "3",
    "payeeFspFeeAmountCurrency": "MWK",
    "payeeReceiveAmount": "100",
    "payeeReceiveAmountCurrency": "MWK",
    "quoteId": "1d0a1eae-02de-4bdb-beb5-fb87f200fa4e",
    "transactionId": "13b362e2-8a73-4e81-a6a1-88cb142cf027",
    "transferAmount": "103",
    "transferAmountCurrency": "MWK"
  },
  note: "Transfer Quote Request",
});


// Send Money DTO

export const sendMoneyDTO = (idValue: string, amount: string,): TMTNSendMoneyRequest => ({
  "homeTransactionId": "HTX123456789",
  "payeeId": "07676767676",
  "payeeIdType": "MSISDN",
  "sendAmount": amount,
  "sendCurrency": "ZMW",
  "receiveCurrency": "ZMW",
  "transactionDescription": "Payment for services",
  "transactionType": "TRANSFER",
  "payer": "Niza Tembo",
  "payerAccount": idValue,
  "dateOfBirth": "1997-04-27"
});


export const updateSendMoneyDTO = (amount: number, acceptQuote: boolean, idValue: string): TMTNUpdateSendMoneyRequest => ({
  "acceptQuote": acceptQuote,
  "msisdn": idValue,
  "amount": amount.toString(),
  "payerMessage": "School Fees",
  "payeeNote": "School Fees"
});

export const TMTNCallbackPayloadDto = () => (
  {
    "financialTransactionId": "string",
    "externalId": "string",
    "amount": "string",
    "currency": "string",
    "payee": {
      "partyIdType": "string",
      "partyId": "string"
    },
    "payeeNote": "string",
    "status": "string"
  }
);
