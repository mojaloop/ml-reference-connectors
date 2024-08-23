import { TUpdateTransferDeps } from '../src/domain/SDKClient';
import { TFineractGetAccountResponse, TFineractTransactionResponse } from '../src/domain/CBSClient';
import * as crypto from 'node:crypto';
import { TtransferPatchNotificationRequest } from 'src/domain/interfaces/types';

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



export const transferPatchNotificationRequestDto: TtransferPatchNotificationRequest = {
  currentState: "COMPLETED", 
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
          partyIdType: 'MSISDN',
          partyIdentifier: '978034884',
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
        amount: '10',
        currency:'KES'
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
};

  
