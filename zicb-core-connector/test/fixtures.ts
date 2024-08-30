import { TUpdateTransferDeps } from '../src/domain/SDKClient';
import { TFineractGetAccountResponse, TFineractTransactionResponse } from '../src/domain/CBSClient';
import * as crypto from 'node:crypto';
import { TQuoteRequest, TtransferRequest } from 'src/domain/interfaces/types';


// Quote Request DTO

export const quoteRequestDto =(idType: string = "ACCOUNT_NO", idValue: string = "1019000001703", amount: string = "100"): TQuoteRequest => ({
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
    });
    