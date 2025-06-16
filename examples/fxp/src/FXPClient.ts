import { randomUUID } from 'crypto';
import {
    IHTTPClient,
    ILogger,
    IFXPClient,
    TFxpConfig,
    TFxQuoteRequest,
    TFxQuoteResponse,
    TConfirmFxTransferRequest,
    TConfirmFxTransferResponse,
    TNotifyFxTransferStateRequest,
    TNotifyFxTransferStateResponse,
} from '@mojaloop/core-connector-lib';

export class MockFXPClient<F> implements IFXPClient<F> {
    constructor(
        public httpClient: IHTTPClient,
        public logger: ILogger,
        public fxpConfig: TFxpConfig<F>,
    ) {}

    async getFxQuote(deps: TFxQuoteRequest): Promise<TFxQuoteResponse> {
        this.logger.info(`Getting fxQuote for fxQuote req`, deps);
        return Promise.resolve({
            homeTransactionId: 'string',
            conversionTerms: {
                conversionId: deps.conversionRequestId,
                determiningTransferId: 'b51ec534-ee48-4575-b6a9-ead2955b8069',
                initiatingFsp: 'string',
                counterPartyFsp: 'string',
                amountType: 'RECEIVE',
                sourceAmount: {
                    currency: 'AED',
                    amount: '123.45',
                },
                targetAmount: {
                    currency: 'AED',
                    amount: '123.45',
                },
                expiration: '2016-05-24T08:38:08.699-04:00',
                charges: [
                    {
                        chargeType: 'string',
                        sourceAmount: {
                            currency: 'AED',
                            amount: '123.45',
                        },
                        targetAmount: {
                            currency: 'AED',
                            amount: '123.45',
                        },
                    },
                ],
                extensionList: {
                    extension: [
                        {
                            key: 'string',
                            value: 'string',
                        },
                    ],
                },
            },
        });
    }
    confirmFxTransfer(deps: TConfirmFxTransferRequest): Promise<TConfirmFxTransferResponse> {
        this.logger.info(`Confirming fxTransfer terms for transfer`, deps);
        return Promise.resolve({
            homeTransactionId: randomUUID(),
            fulfilment: 'WLctttbu2HvTsa1XWvUoGRcQozHsqeu9Ahl2JW9Bsu8',
            completedTimestamp: '2016-05-24T08:38:08.699-04:00',
            conversionState: 'RESERVED',
            extensionList: {
                extension: [
                    {
                        key: 'string',
                        value: 'string',
                    },
                ],
            },
        });
    }
    notifyFxTransferState(deps: TNotifyFxTransferStateRequest): Promise<TNotifyFxTransferStateResponse> {
        this.logger.info(`Received notification for fxTransfer`, deps);
        return Promise.resolve();
    }
}
