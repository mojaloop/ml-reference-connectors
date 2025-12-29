import {
    ICbsClient,
    IHTTPClient,
    ILogger,
    Party,
    TCBSConfig,
    TCBSUpdateSendMoneyRequest,
    TGetKycArgs,
    TPayeeExtensionListEntry,
    TQuoteRequest,
    TQuoteResponse,
    TtransferErrorResponse,
    TtransferPatchNotificationRequest,
    TtransferRequest,
    TtransferResponse,
} from '@mojaloop/core-connector-lib';
import { ConnectorError } from './errors';

export class MockCBSClient<D> implements ICbsClient {
    cbsConfig: TCBSConfig<D>;
    httpClient: IHTTPClient;
    logger: ILogger;

    constructor(cbsConfig: TCBSConfig<D>, httpClient: IHTTPClient, logger: ILogger) {
        this.cbsConfig = cbsConfig;
        this.httpClient = httpClient;
        this.logger = logger;
    }

    async getAccountInfo(deps: TGetKycArgs): Promise<Party> {
        this.logger.info(`Getting party account information`, deps);
        if (deps.accountId === '46733123450') {
            throw ConnectorError.cbsConfigUndefined('Party Not Found', '2000', 500);
        }
        const party = {
            dateOfBirth: '1990-05-15',
            displayName: 'John Doe',
            firstName: 'John',
            fspId: 'yz123',
            idSubValue: deps.subId,
            idType: 'MSISDN',
            idValue: deps.accountId,
            lastName: 'Doe',
            merchantClassificationCode: '5311',
            middleName: 'Alexander',
            type: 'PERSON',
            supportedCurrencies: this.cbsConfig.CURRENCY,
            kycInformation: 'Verified with national ID and proof of address',
        };
        this.logger.debug('Party', party);
        return Promise.resolve(party);
    }

    getAccountDiscoveryExtensionLists(): TPayeeExtensionListEntry[] {
        return [
            {
                key: 'Rpt.UpdtdPtyAndAcctId.Agt.FinInstnId.LEI',
                value: '01HTZ7V7JEMZ6NR90YKE6XK2X3',
            },
        ];
    }

    async getQuote(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Processing quoteRequest`, quoteRequest);
        return Promise.resolve({
            payeeFspCommissionAmountCurrency: this.cbsConfig.CURRENCY,
            payeeFspFeeAmount: '0',
            payeeFspFeeAmountCurrency: this.cbsConfig.CURRENCY,
            payeeReceiveAmount: quoteRequest.amount,
            payeeReceiveAmountCurrency: this.cbsConfig.CURRENCY,
            quoteId: quoteRequest.quoteId,
            transactionId: quoteRequest.transactionId,
            transferAmount: quoteRequest.amount,
            transferAmountCurrency: this.cbsConfig.CURRENCY,
        });
    }

    async reserveFunds(transfer: TtransferRequest): Promise<TtransferResponse> {
        this.logger.info(`Reserving funds for transfer request`, transfer);
        if (transfer.to.idValue === '+2203628891') {
            // timeout
            await new Promise((resolve) => setTimeout(resolve, 300_000));
        } else if (transfer.to.idValue === '+2203628890') {
            // abort
            throw ConnectorError.cbsConfigUndefined('Abort Transfer', '2000', 500);
        }
        return Promise.resolve({
            homeTransactionId: crypto.randomUUID(),
            transferState: 'RESERVED',
        });
    }

    async unreserveFunds(transferUpdate: TtransferPatchNotificationRequest): Promise<void> {
        this.logger.info(`Unreserving funds for request `, transferUpdate);
        return Promise.resolve();
    }

    async commitReservedFunds(transferUpdate: TtransferPatchNotificationRequest): Promise<void> {
        this.logger.info(`Committing funds for request `, transferUpdate);
        return Promise.resolve();
    }

    async handleRefund(
        updateSendMoneyDeps: TCBSUpdateSendMoneyRequest,
        transferId: string,
        transferRes: TtransferErrorResponse,
    ): Promise<void> {
        this.logger.info(`Processing refund for req ${updateSendMoneyDeps} and transferId ${transferId}`);
    }
}
