import { TConfirmFxTransferRequest, TFxQuoteRequest, TNotifyFxTransferStateRequest } from "@mojaloop/core-connector-lib";

export const fxQuotesReqDTO = (): TFxQuoteRequest => ({
  "conversionRequestId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
  "conversionTerms": {
    "conversionId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
    "determiningTransferId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
    "initiatingFsp": "string",
    "counterPartyFsp": "string",
    "amountType": "RECEIVE",
    "sourceAmount": {
      "currency": "AED",
      "amount": "123.45"
    },
    "targetAmount": {
      "currency": "AED",
      "amount": "123.45"
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
});

export const fxTransferDTO = (): TConfirmFxTransferRequest => ({
  "homeTransactionId":  crypto.randomUUID(),
  "commitRequestId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
  "determiningTransferId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
  "initiatingFsp": "string",
  "counterPartyFsp": "string",
  "sourceAmount": {
    "currency": "ZMW",
    "amount": "100"
  },
  "targetAmount": {
    "currency": "MWK",
    "amount": "2000"
  },
  "condition": "string"
});

export const fxTransferNotificationDTO = (): TNotifyFxTransferStateRequest => ({
  "homeTransactionId": "string",
  "fulfilment": "WLctttbu2HvTsa1XWvUoGRcQozHsqeu9Ahl2JW9Bsu8",
  "completedTimestamp": "2016-05-24T08:38:08.699-04:00",
  "conversionState": "COMMITTED",
  "extensionList": {
    "extension": [
      {
        "key": "string",
        "value": "string"
      }
    ]
  }
});