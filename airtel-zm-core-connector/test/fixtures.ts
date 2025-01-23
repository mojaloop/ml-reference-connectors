import { TSDKOutboundTransferRequest, TSDKOutboundTransferResponse, TUpdateTransferDeps } from '../src/domain/SDKClient';
import { TAirtelSendMoneyRequest, TAirtelUpdateSendMoneyRequest, TCallbackRequest, TFineractGetAccountResponse, TFineractTransactionResponse } from '../src/domain/CBSClient';
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

export const sdkInitiateTransferResponseDto = (idValue: string, currentState: components["schemas"]["transferStatus"]): THttpResponse<TSDKOutboundTransferResponse> => ({
  statusCode: 200,
  data: {
    homeTransactionId: crypto.randomUUID(),
    from: {
      idType: "MSISDN",
      idValue: idValue,
      supportedCurrencies: [
        'ZMW'
      ]
    },
    to: {
      idType: "MSISDN",
      idValue: idValue,
      supportedCurrencies: [
        'MWK'
      ]
    },
    amountType: "SEND",
    currency: "ZMW",
    amount: "1000",
    transactionType: "TRANSFER",
    currentState: currentState,
    "quoteResponse": {
      "body": {
        "transferAmount": {
          "currency": "MWK",
          "amount": "1000"
        },
        "payeeReceiveAmount": {
          "currency": "MWK",
          "amount": "1000"
        },
        "payeeFspFee": {
          "currency": "MWK",
          "amount": "0"
        },
        "payeeFspCommission": {
          "currency": "AED",
          "amount": "0"
        },
        "expiration": "2016-05-24T08:38:08.699-04:00",
        "geoCode": {
          "latitude": "+45.4215",
          "longitude": "+75.6972"
        },
        "ilpPacket": "AYIBgQAAAAAAAASwNGxldmVsb25lLmRmc3AxLm1lci45T2RTOF81MDdqUUZERmZlakgyOVc4bXFmNEpLMHlGTFGCAUBQU0svMS4wCk5vbmNlOiB1SXlweUYzY3pYSXBFdzVVc05TYWh3CkVuY3J5cHRpb246IG5vbmUKUGF5bWVudC1JZDogMTMyMzZhM2ItOGZhOC00MTYzLTg0NDctNGMzZWQzZGE5OGE3CgpDb250ZW50LUxlbmd0aDogMTM1CkNvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvbgpTZW5kZXItSWRlbnRpZmllcjogOTI4MDYzOTEKCiJ7XCJmZWVcIjowLFwidHJhbnNmZXJDb2RlXCI6XCJpbnZvaWNlXCIsXCJkZWJpdE5hbWVcIjpcImFsaWNlIGNvb3BlclwiLFwiY3JlZGl0TmFtZVwiOlwibWVyIGNoYW50XCIsXCJkZWJpdElkZW50aWZpZXJcIjpcIjkyODA2MzkxXCJ9IgA",
        "condition": "string",
        "extensionList": {
          "extension": [
            {
              "key": "string",
              "value": "string"
            }
          ]
        }
      },
      "headers": {}
    },
    transferId: crypto.randomUUID(),
    "fxQuotesResponse": {
      "body": {
        "homeTransactionId": "string",
        "condition": "string",
        "conversionTerms": {
          "conversionId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
          "determiningTransferId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
          "initiatingFsp": "string",
          "counterPartyFsp": "string",
          "amountType": "RECEIVE",
          "sourceAmount": {
            "currency": "ZMW",
            "amount": "1000"
          },
          "targetAmount": {
            "currency": "MWK",
            "amount": "1000"
          },
          "expiration": "2016-05-24T08:38:08.699-04:00",
          "charges": [
            {
              "chargeType": "string",
              "sourceAmount": {
                "currency": "AED",
                "amount": "123.45"
              },
              "targetAmount": {
                "currency": "AED",
                "amount": "123.45"
              }
            }
          ],
          "extensionList": {
            "extension": [
              {
                "key": "string",
                "value": "string"
              }
            ]
          }
        }
      },
      "headers": {}
    }
  }
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
  transferId: "47e8a9cd-3d89-55c5-a15a-b57a28ad763e"
});


export const quoteRequestDto = (idType: string = "MSISDN", idValue: string = "971938765", amount: string = "1"): TQuoteRequest => ({
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
  currency: "ZMW",
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
        currency: "ZMW",
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
        supportedCurrencies: ["ZMW"],
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
});



// Send Money DTO

export const sendMoneyMerchantPaymentDTO = (idValue: string, amount: string, amountType: "RECEIVE" | "SEND"): TAirtelSendMoneyRequest => ({
  "homeTransactionId": "HTX123456789",
  "amountType": amountType,
  "payeeId": "07676767676",
  "payeeIdType": "MSISDN",
  "sendAmount": amount,
  "sendCurrency": "ZMW",
  "receiveCurrency": "ZMW",
  "transactionDescription": "Payment for services",
  "transactionType": "TRANSFER",
  "payer": {
    "name": "Elijah Okello",
    payerId: idValue,
    DateAndPlaceOfBirth: {
      BirthDt: "1985-04-12",
      PrvcOfBirth: "Lusaka",
      CityOfBirth: "Lusaka",
      CtryOfBirth: "Lusaka",
    },
  },

});


export const updateSendMoneyMerchantPaymentDTO = (amount: number, acceptQuote: boolean, idValue: string): TAirtelUpdateSendMoneyRequest => ({
  "acceptQuote": acceptQuote,
  "msisdn": idValue,
  "amount": amount.toString()
});

export const callbackPayloadDto = (amount: string, transferStatus: string): TCallbackRequest => ({
  "transaction": {
    "id": crypto.randomUUID(),
    "message": `Paid ZMW ${amount} to TECHNOLOGIES LIMITED Charge UGX 1, Trans ID MP210603.1234.L06941.`,
    "status_code": transferStatus,
    "airtel_money_id": "MP210603.1234.L06941"
  }
});


export const tSDKOutboundTransferRequestDTO = (): TSDKOutboundTransferRequest => ({
  "amount": "1000",
  "amountType": "SEND",
  "currency": "ZMW",
  "from": {
    "displayName": "Chimweso Faith Mukoko Test1",
    "extensionList": [],
    "firstName": "Chimweso Faith Mukoko",
    "fspId": "airtelzambia",
    "idType": "MSISDN",
    "idValue": "971938765",
    "lastName": "Test1",
    "merchantClassificationCode": "123",
    "middleName": "Chimweso Faith Mukoko"
  },
  "homeTransactionId": "4ba7d0ba-bcaf-474f-b0e2-63cad27b0865",
  "to": {
    "idType": "MSISDN",
    "idValue": "07676767676"
  },
  "transactionType": "TRANSFER"
});
