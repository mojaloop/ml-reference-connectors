import { randomUUID } from "crypto";
import { ICbsClient, TCBSConfig, IHTTPClient, ILogger, TGetKycArgs, Party, TPayeeExtensionListEntry, TQuoteRequest, TQuoteResponse, TtransferRequest, TtransferResponse, TtransferPatchNotificationRequest, TCBSUpdateSendMoneyRequest } from "../src/domain";
import { IFXPClient, TConfirmFxTransferRequest, TConfirmFxTransferResponse, TFxpConfig, TFxQuoteRequest, TFxQuoteResponse, TNotifyFxTransferStateRequest, TNotifyFxTransferStateResponse } from "../src/domain/FXPClient";

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
        this.logger.info(`Getting party account information`, deps.accountId);
        const party = {
            "dateOfBirth": "1990-05-15",
            "displayName": "John Doe",
            "extensionList": this.getAccountDiscoveryExtensionLists(),
            "firstName": "John",
            "fspId": "fsp-xyz123",
            "idSubValue": "sub-id-456",
            "idType": "nationalId",
            "idValue": deps.accountId,
            "lastName": "Doe",
            "merchantClassificationCode": "5311",
            "middleName": "Alexander",
            "type": "PERSON",
            "supportedCurrencies": "USD,EUR",
            "kycInformation": "Verified with national ID and proof of address"
        };
        return Promise.resolve(party);
    }

    getAccountDiscoveryExtensionLists(): TPayeeExtensionListEntry[] {
        return [
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Agt.FinInstnId.LEI",
                "value": "01HTZ7V7JEMZ6NR90YKE6XK2X3"
            }
        ];
    }

    async getQuote(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Processing quoteRequest`, quoteRequest);
        return Promise.resolve({
            "expiration": "2025-12-31T23:59:59.000Z",
            "extensionList": [
                {
                    "key": "promoCode",
                    "value": "NEWYEAR2025"
                }
            ],
            "geoCode": {
                "latitude": "-13.9626",
                "longitude": "33.7741"
            },
            "payeeFspCommissionAmount": "5.00",
            "payeeFspCommissionAmountCurrency": "MWK",
            "payeeFspFeeAmount": "2.50",
            "payeeFspFeeAmountCurrency": "MWK",
            "payeeReceiveAmount": "9200.00",
            "payeeReceiveAmountCurrency": "MWK",
            "quoteId": "c8b16a12-1a2b-4e30-b2a1-1f71234abcde",
            "transactionId": "d7f816cd-2b47-43ed-99c2-e9f5b123abcd",
            "transferAmount": "10000.00",
            "transferAmountCurrency": "MWK"
        });
    }

    async reserveFunds(transfer: TtransferRequest): Promise<TtransferResponse> {
        this.logger.info(`Reserving funds for transfer request`, transfer);
        return Promise.resolve({
            "completedTimestamp": "string",
            "fulfilment": "WLctttbu2HvTsa1XWvUoGRcQozHsqeu9Ahl2JW9Bsu8",
            "homeTransactionId": "string",
            "transferState": "RESERVED"
        });
    }

    async commitReservedFunds(transferUpdate: TtransferPatchNotificationRequest): Promise<void> {
        this.logger.info(`Committing funds for request `, transferUpdate);
        return Promise.resolve();
    }

    async handleRefund(updateSendMoneyDeps: TCBSUpdateSendMoneyRequest, transferId: string): Promise<void> {
        this.logger.info(`Processing refund for req ${updateSendMoneyDeps} and transferId ${transferId}`);
        return Promise.resolve();
    }

}

export class MockFXPClient<F> implements IFXPClient<F> {
    constructor(
        public httpClient: IHTTPClient,
        public logger: ILogger,
        public fxpConfig: TFxpConfig<F>
    ) { }

    async getFxQuote(deps: TFxQuoteRequest): Promise<TFxQuoteResponse> {
        this.logger.info(`Getting fxQuote for fxQuote req`, deps);
        return Promise.resolve({
            "homeTransactionId": "string",
            "conversionTerms": {
                "conversionId": deps.conversionRequestId,
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
    }
    confirmFxTransfer(deps: TConfirmFxTransferRequest): Promise<TConfirmFxTransferResponse> {
        this.logger.info(`Confirming fxTransfer terms for transfer`, deps);
        return Promise.resolve({
            "homeTransactionId": randomUUID(),
            "fulfilment": "WLctttbu2HvTsa1XWvUoGRcQozHsqeu9Ahl2JW9Bsu8",
            "completedTimestamp": "2016-05-24T08:38:08.699-04:00",
            "conversionState": "RESERVED",
            "extensionList": {
                "extension": [
                    {
                        "key": "string",
                        "value": "string"
                    }
                ]
            }
        });
    }
    notifyFxTransferState(deps: TNotifyFxTransferStateRequest): Promise<TNotifyFxTransferStateResponse> {
        this.logger.info(`Received notification for fxTransfer`, deps);
        return Promise.resolve();
    }

}