import { TCBSUpdateSendMoneyRequest, TQuoteRequest, TtransferPatchNotificationRequest, TtransferRequest } from "@mojaloop/core-connector-lib";

export const quoteRequestDTO = (IdValue: string): TQuoteRequest => ({
  "homeR2PTransactionId": crypto.randomUUID(),
  "amount": "1000",
  "amountType": "SEND",
  "currency": "UGX",
  "expiration": "string",
  "extensionList": [
    {
      "key": "string",
      "value": "string"
    }
  ],
  "feesAmount": "string",
  "feesCurrency": "AED",
  "from": {
    "dateOfBirth": "string",
    "displayName": "string",
    "extensionList": [
      {
        "key": "string",
        "value": "string"
      }
    ],
    "firstName": "string",
    "fspId": "string",
    "idSubValue": "string",
    "idType": "MSISDN",
    "idValue": "string",
    "lastName": "string",
    "merchantClassificationCode": "string",
    "middleName": "string",
    "type": "CONSUMER"
  },
  "geoCode": {
    "latitude": "string",
    "longitude": "string"
  },
  "initiator": "PAYER",
  "initiatorType": "CONSUMER",
  "note": "string",
  "quoteId": "string",
  "subScenario": "LOCALLY_DEFINED_SUBSCENARIO",
  "to": {
    "dateOfBirth": "string",
    "displayName": "string",
    "extensionList": [
      {
        "key": "string",
        "value": "string"
      }
    ],
    "firstName": "string",
    "fspId": "string",
    "idSubValue": "string",
    "idType": "MSISDN",
    "idValue": IdValue,
    "lastName": "string",
    "merchantClassificationCode": "string",
    "middleName": "string",
    "type": "CONSUMER"
  },
  "transactionId": "string",
  "transactionType": "TRANSFER",
  "transactionRequestId": "string"
}
);

export const reserveTransferDTO = (amount: string): TtransferRequest => ({
  "transferId": crypto.randomUUID(),
  "amount": amount,
  "amountType": "SEND",
  "currency": "UGX",
  "from": {
    "idType": "MSISDN",
    "idValue": "777123456"
  },
  "to": {
    "idType": "MSISDN",
    "idValue": "56733123450"
  },
  "ilpPacket": {
    "data": {
      "amount": {
        "amount": "400",
        "currency": "EUR"
      },
      "payee": {
        "partyIdInfo": {
          "partyIdType": "MSISDN",
          "partyIdentifier": "56733123450",
          "fspId": "mtnuganda"
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
        "supportedCurrencies": [
          "EUR"
        ]
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
        "supportedCurrencies": [
          "ZMW"
        ]
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

export const transferNotificationDTO = (): TtransferPatchNotificationRequest => ({
  "currentState": "COMPLETED",
  "direction": "INBOUND",
  "finalNotification": {
    "completedTimestamp": "2024-02-29T23:59:59.123Z",
    "extensionList": [
      {
        "key": "string",
        "value": "string"
      }
    ],
    "transferState": "RECEIVED"
  },
  "initiatedTimestamp": "2024-02-29T23:59:59.123Z",
  "lastError": {
    "httpStatusCode": 0,
    "mojaloopError": {
      "errorInformation": {
        "errorCode": "5100",
        "errorDescription": "string",
        "extensionList": {
          "extension": [
            {
              "key": "string",
              "value": "string"
            }
          ]
        }
      }
    }
  },
  "quote": {
    "fulfilment": "string",
    "internalRequest": {},
    "mojaloopResponse": {},
    "request": {},
    "response": {}
  },
  "quoteRequest": {
    "body": {
      "quoteId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
      "transactionId": "{{$randomUUID}}",
      "transactionRequestId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
      "payee": {
        "partyIdInfo": {
          "partyIdType": "MSISDN",
          "partyIdentifier": "56733123450",
          "partySubIdOrType": "string",
          "fspId": "string",
          "extensionList": {
            "extension": [
              {
                "key": "string",
                "value": "string"
              }
            ]
          }
        },
        "merchantClassificationCode": "string",
        "name": "string",
        "personalInfo": {
          "complexName": {
            "firstName": "Henrik",
            "middleName": "Johannes",
            "lastName": "Karlsson"
          },
          "dateOfBirth": "1966-06-16",
          "kycInformation": "{\n    \"metadata\": {\n        \"format\": \"JSON\",\n        \"version\": \"1.0\",\n        \"description\": \"Data containing KYC Information\"\n    },\n    \"data\": {\n        \"name\": \"John Doe\",\n        \"dob\": \"1980-05-15\",\n        \"gender\": \"Male\",\n        \"address\": \"123 Main Street, Anytown, USA\",\n        \"email\": \"johndoe@example.com\",\n        \"phone\": \"+1 555-123-4567\",\n        \"nationality\": \"US\",\n        \"passport_number\": \"AB1234567\",\n        \"issue_date\": \"2010-02-20\",\n        \"expiry_date\": \"2025-02-20\",\n        \"bank_account_number\": \"1234567890\",\n        \"bank_name\": \"Example Bank\",\n        \"employer\": \"ABC Company\",\n        \"occupation\": \"Software Engineer\",\n        \"income\": \"$80,000 per year\",\n        \"marital_status\": \"Single\",\n        \"dependents\": 0,\n        \"risk_level\": \"Low\"\n    }\n}"
        },
        "supportedCurrencies": [
          "AED"
        ]
      },
      "payer": {
        "partyIdInfo": {
          "partyIdType": "MSISDN",
          "partyIdentifier": "16135551212",
          "partySubIdOrType": "string",
          "fspId": "string",
          "extensionList": {
            "extension": [
              {
                "key": "string",
                "value": "string"
              }
            ]
          }
        },
        "merchantClassificationCode": "string",
        "name": "string",
        "personalInfo": {
          "complexName": {
            "firstName": "Henrik",
            "middleName": "Johannes",
            "lastName": "Karlsson"
          },
          "dateOfBirth": "1966-06-16",
          "kycInformation": "{\n    \"metadata\": {\n        \"format\": \"JSON\",\n        \"version\": \"1.0\",\n        \"description\": \"Data containing KYC Information\"\n    },\n    \"data\": {\n        \"name\": \"John Doe\",\n        \"dob\": \"1980-05-15\",\n        \"gender\": \"Male\",\n        \"address\": \"123 Main Street, Anytown, USA\",\n        \"email\": \"johndoe@example.com\",\n        \"phone\": \"+1 555-123-4567\",\n        \"nationality\": \"US\",\n        \"passport_number\": \"AB1234567\",\n        \"issue_date\": \"2010-02-20\",\n        \"expiry_date\": \"2025-02-20\",\n        \"bank_account_number\": \"1234567890\",\n        \"bank_name\": \"Example Bank\",\n        \"employer\": \"ABC Company\",\n        \"occupation\": \"Software Engineer\",\n        \"income\": \"$80,000 per year\",\n        \"marital_status\": \"Single\",\n        \"dependents\": 0,\n        \"risk_level\": \"Low\"\n    }\n}"
        },
        "supportedCurrencies": [
          "AED"
        ]
      },
      "amountType": "RECEIVE",
      "amount": {
        "currency": "MWK",
        "amount": "5000000"
      },
      "fees": {
        "currency": "AED",
        "amount": "123.45"
      },
      "transactionType": {
        "scenario": "DEPOSIT",
        "subScenario": "LOCALLY_DEFINED_SUBSCENARIO",
        "initiator": "PAYEE",
        "initiatorType": "CONSUMER",
        "refundInfo": {
          "originalTransactionId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
          "refundReason": "Free text indicating reason for the refund."
        },
        "balanceOfPayments": "123"
      },
      "converter": "PAYER",
      "currencyConversion": {
        "sourceAmount": {
          "currency": "AED",
          "amount": "123.45"
        },
        "targetAmount": {
          "currency": "AED",
          "amount": "123.45"
        }
      },
      "geoCode": {
        "latitude": "+45.4215",
        "longitude": "+75.6972"
      },
      "note": "School Fees.",
      "expiration": "2016-05-24T08:38:08.699-04:00",
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
  "quoteResponse": {
    "body": {},
    "headers": {}
  },
  "transferId": "{{$randomUUID}}"
});

export const confirmSendMoneyDTO = (): TCBSUpdateSendMoneyRequest => ({
  "acceptQuote": true,
  "homeTransactionId": "HTX123456789"
});