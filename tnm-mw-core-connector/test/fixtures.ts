import { TSDKOutboundTransferResponse, TtransferContinuationResponse } from '../src/domain/SDKClient';
import { TNMCallbackPayload, TNMSendMoneyRequest, TNMUpdateSendMoneyRequest, } from '../src/domain/CBSClient';
import * as crypto from 'node:crypto';
import { TtransferPatchNotificationRequest, TQuoteRequest, TtransferRequest, THttpResponse } from 'src/domain/interfaces/types';
import { components } from '@mojaloop/api-snippets/lib/sdk-scheme-adapter/v2_1_0/outbound/openapi';

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
    idValue: "978034884",
    extensionList: [
      {
        "key": "testkey",
        "value": "TestVal"
      }
    ]
  },
  initiator: "PAYER",
  initiatorType: "CONSUMER",
  quoteId: crypto.randomUUID(),
  to: {
    //@ts-expect-error partyIdType var not of type IdType
    idType: idType,
    idValue: idValue,
    extensionList: [
      {
        "key": "testkey",
        "value": "TestVal"
      }
    ]
  },
  transactionId: crypto.randomUUID(),
  transactionType: "TRANSFER"
});

export const transferRequestDto = (idType: string, idValue: string, amount: string): TtransferRequest => ({
  "transferId": crypto.randomUUID(),
  "amount": amount,
  "amountType": "SEND",
  "currency": "MWK",
  "from": {
    "idType": "MSISDN",
    "idValue": "777123456",
    extensionList: [
      {
        "key": "testkey",
        "value": "TestVal"
      }
    ]
  },
  "to": {
    //@ts-expect-error idType 
    "idType": idType,
    "idValue": idValue,
    extensionList: [
      {
        "key": "testkey",
        "value": "TestVal"
      }
    ]
  },
  "ilpPacket": {
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
  "note": "Transfer Quote Request"
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
  "payer": {
    "name": "Elijah Okello",
    "payerId": idValue,
    "DateAndPlaceOfBirth": {
      "BirthDt": "1985-04-12",
      "PrvcOfBirth": "Kampala",
      "CityOfBirth": "Kampala",
      "CtryOfBirth": "Uganda"

    }
  },
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
      idValue: idValue,
      supportedCurrencies: [
        "ZMW"
      ]
    },
    amountType: "SEND",
    currency: "MWK",
    amount: "1000",
    transactionType: "TRANSFER",
    currentState: currentState,
    transferId: crypto.randomUUID(),
    "quoteResponse": {
      "body": {
        "transferAmount": {
          "currency": "ZMW",
          "amount": "1000"
        },
        "payeeReceiveAmount": {
          "currency": "ZMW",
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
            "currency": "MWK",
            "amount": "1000"
          },
          "targetAmount": {
            "currency": "ZMW",
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

export const TNMCallbackPayloadDto = (): TNMCallbackPayload => ({
  receipt_number: crypto.randomUUID(),
  result_description: "Completed Successfully",
  result_code: "0",
  result_time: new Date().toDateString(), //Datetime
  transaction_id: crypto.randomUUID(),
  success: true
});
