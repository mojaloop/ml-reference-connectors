/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list (alphabetical ordering) of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.


 - Okello Ivan Elijah <elijahokello90@gmail.com>
- Kasweka Michael Mukoko <kaswekamukoko@gmail.com>
 - Niza Tembo <mcwayzj@gmail.com>

 --------------
 ******/

'use strict';

import { randomUUID } from 'crypto';
import {
    IFineractClient,
    PartyType,
    TFineractConfig,
    TFineractTransferDeps,
    IAirtelClient,
    TAirtelDisbursementRequestBody,
    TAirtelConfig,
    TAirtelUpdateSendMoneyRequest,
    TAirtelCollectMoneyRequest,
    AirtelError,
} from './CBSClient';
import {
    ILogger,
    TLookupPartyInfoResponse,
    TQuoteResponse,
    TQuoteRequest,
    TtransferResponse,
    TtransferRequest,
    ValidationError,
    TtransferPatchNotificationRequest,
    THttpResponse,
} from './interfaces';
import {
    ISDKClient,
    SDKClientError,
    TSDKOutboundTransferRequest,
    TSDKOutboundTransferResponse,
    TtransferContinuationResponse,
} from './SDKClient';
import {
    TAirtelSendMoneyRequest,
    TAirtelSendMoneyResponse,
} from './CBSClient';
import config from '../config';

export class CoreConnectorAggregate {
    public IdType: string;
    private logger: ILogger;
    DATE_FORMAT = 'dd MM yy';

    constructor(
        private readonly fineractConfig: TFineractConfig,
        private readonly fineractClient: IFineractClient,
        private readonly sdkClient: ISDKClient,
        private readonly airtelConfig: TAirtelConfig,
        private readonly airtelClient: IAirtelClient,
        logger: ILogger,
    ) {
        this.IdType = fineractConfig.FINERACT_ID_TYPE;
        this.logger = logger;
    }

    async getParties(id: string, idType: string): Promise<TLookupPartyInfoResponse> {
        this.logger.info(`Get Parties for ${id}`);
        if (!(idType === config.get("airtel.SUPPORTED_ID_TYPE"))) {
            throw ValidationError.unsupportedIdTypeError();
        }

        const lookupRes = await this.airtelClient.getKyc({ msisdn: id });
        const party = {
            data: {
                displayName: `${lookupRes.data.first_name} ${lookupRes.data.last_name}`,
                firstName: lookupRes.data.first_name,
                idType: config.get("airtel.SUPPORTED_ID_TYPE"),
                idValue: id,
                lastName: lookupRes.data.last_name,
                middleName: lookupRes.data.first_name,
                type: PartyType.CONSUMER,
                kycInformation: `${JSON.stringify(lookupRes)}`,
            },
            statusCode: Number(lookupRes.status.code),
        };
        this.logger.info(`Party found`, { party });
        return party;
    }

    async quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Get Parties for ${this.IdType} ${quoteRequest.to.idValue}`);
        if (quoteRequest.to.idType !== this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }

        if (quoteRequest.currency !== config.get("airtel.X_CURRENCY")) {
            throw ValidationError.unsupportedCurrencyError();
        }

        const res = await this.airtelClient.getKyc({
            msisdn: quoteRequest.to.idValue,
        
        });

        if(res.data.is_barred){
            throw AirtelError.payeeBlockedError("Account is barred", 500, "5400");
        }

        const serviceCharge = config.get("airtel.SERVICE_CHARGE");

        this.checkAccountBarred(quoteRequest.to.idValue);

        const quoteExpiration = config.get("airtel.EXPIRATION_DURATION");
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + Number(quoteExpiration));
        const expirationJSON = expiration.toJSON();

        return {
            expiration: expirationJSON,
            payeeFspCommissionAmount: '0',
            payeeFspCommissionAmountCurrency: quoteRequest.currency,
            payeeFspFeeAmount: serviceCharge,
            payeeFspFeeAmountCurrency: quoteRequest.currency,
            payeeReceiveAmount: quoteRequest.amount,
            payeeReceiveAmountCurrency: quoteRequest.currency,
            quoteId: quoteRequest.quoteId,
            transactionId: quoteRequest.transactionId,
            transferAmount: quoteRequest.amount,
            transferAmountCurrency: quoteRequest.currency,
        };
    }

    private async checkAccountBarred(msisdn: string): Promise<void> {

        const res = await this.airtelClient.getKyc({ msisdn: msisdn });

        if (res.data.is_barred) {
            throw ValidationError.accountBarredError();
        }
    }

    async receiveTransfer(transfer: TtransferRequest): Promise<TtransferResponse> {
        this.logger.info(`Transfer for  ${this.IdType} ${transfer.to.idValue}`);
        if (transfer.to.idType != this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }
        if (transfer.currency !== config.get("airtel.X_CURRENCY")) {
            throw ValidationError.unsupportedCurrencyError();
        }
        if (!this.validateQuote(transfer)) {
            throw ValidationError.invalidQuoteError();
        }

        this.checkAccountBarred(transfer.to.idValue);
        return {
            completedTimestamp: new Date().toJSON(),
            homeTransactionId: transfer.transferId,
            transferState: 'RECEIVED',
        };
    }

    private validateQuote(transfer: TtransferRequest): boolean {
        // todo define implmentation
        this.logger.info(`Validating code for transfer with amount ${transfer.amount}`);
        return true;
    }

    private validatePatchQuote(transfer: TtransferPatchNotificationRequest): boolean {
        this.logger.info(`Validating code for transfer with state ${transfer.currentState}`);
        // todo define implmentation
        return true;
    }

    async updateTransfer(updateTransferPayload: TtransferPatchNotificationRequest, transferId: string): Promise<void> {
        this.logger.info(`Committing The Transfer with id ${transferId}`);
        if (updateTransferPayload.currentState !== 'COMPLETED') {
            throw ValidationError.transferNotCompletedError();
        }
        if (!this.validatePatchQuote(updateTransferPayload)) {
            throw ValidationError.invalidQuoteError();
        }
        const airtelDisbursementRequest: TAirtelDisbursementRequestBody = this.getDisbursementRequestBody(updateTransferPayload);
        await this.airtelClient.sendMoney(airtelDisbursementRequest);
    }


    private getDisbursementRequestBody(requestBody: TtransferPatchNotificationRequest): TAirtelDisbursementRequestBody {
        if (!requestBody.quoteRequest) {
            throw ValidationError.quoteNotDefinedError('Quote Not Defined Error', '5000', 500);
        }
        return {
            "payee": {
                "msisdn": requestBody.quoteRequest.body.payee.partyIdInfo.partyIdentifier,
                "wallet_type": "NORMAL"
            },
            "reference": requestBody.quoteRequest.body.transactionId,
            "pin": this.airtelConfig.AIRTEL_PIN,
            "transaction": {
                "amount": Number(requestBody.quoteRequest.body.amount),
                "id": requestBody.quoteRequest.body.transactionId,
                "type": "B2C"
            }
        };
    }


    async sendTransfer(transfer: TAirtelSendMoneyRequest): Promise<TAirtelSendMoneyResponse> {
        this.logger.info(`Transfer from airtel account with ID${transfer.payerAccount}`);

        const transferRequest: TSDKOutboundTransferRequest = this.getTSDKOutboundTransferRequest(transfer);
        const res = await this.sdkClient.initiateTransfer(transferRequest);
        let acceptRes: THttpResponse<TtransferContinuationResponse>;

        if (res.data.currentState === 'WAITING_FOR_CONVERSION_ACCEPTANCE') {
            if (!this.validateConversionTerms(res.data)) {
                if (!res.data.transferId) {
                    throw ValidationError.transferIdNotDefinedError("Transfer Id not defined in transfer response", "4000", 500);
                }

                acceptRes = await this.sdkClient.updateTransfer({
                    "acceptConversion": false
                }, res.data.transferId);
                throw ValidationError.invalidConversionQuoteError("Recieved Conversion Terms are invalid", "4000", 500);
            }
            else {
                if (!res.data.transferId) {
                    throw ValidationError.transferIdNotDefinedError("Transfer Id not defined in transfer response", "4000", 500);
                }
                acceptRes = await this.sdkClient.updateTransfer({
                    "acceptConversion": true
                }, res.data.transferId);
            }

            if (!this.validateReturnedQuote(acceptRes.data)) {
                throw ValidationError.invalidReturnedQuoteError();
            }

            return this.getTAirtelSendMoneyResponse(acceptRes.data);
        }
        if (!this.validateReturnedQuote(res.data)) {
            throw ValidationError.invalidReturnedQuoteError();
        }

        return this.getTAirtelSendMoneyResponse(res.data);

    }

    private getTSDKOutboundTransferRequest(transfer: TAirtelSendMoneyRequest): TSDKOutboundTransferRequest {
        return {
            'homeTransactionId': randomUUID(),
            'from': {
                'idType': this.airtelConfig.SUPPORTED_ID_TYPE,
                'idValue': transfer.payerAccount
            },
            'to': {
                'idType': transfer.payeeIdType,
                'idValue': transfer.payeeId
            },
            'amountType': 'SEND',
            'currency': transfer.sendCurrency,
            'amount': transfer.sendAmount,
            'transactionType': transfer.transactionType,
        };
    }

    private getTAirtelSendMoneyResponse(transfer: TSDKOutboundTransferResponse): TAirtelSendMoneyResponse {
        if (!(transfer.to.kycInformation) || !(transfer.quoteResponse) || !(transfer.fxQuotesResponse) || !(transfer.quoteResponse?.body.payeeReceiveAmount) || !(transfer.quoteResponse?.body.payeeFspFee) || !(transfer.transferId)) {
            throw ValidationError.notEnoughInformationError();
        }
        return {
            "payeeDetails": transfer.to.kycInformation,
            "receiveAmount": transfer.quoteResponse?.body.payeeReceiveAmount?.amount,
            "receiveCurrency": transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency,
            "fees": transfer.quoteResponse?.body.payeeFspFee?.amount,
            "feeCurrency": transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency,
            "transactionId": transfer.transferId,
        };
    }

    private validateConversionTerms(transferResponse: TSDKOutboundTransferResponse): boolean {
        this.logger.info(`Validating Conversion Terms with transfer response amount${transferResponse.amount}`);
        // todo: Define Implementations
        return true;
    }

    private validateReturnedQuote(transferResponse: TSDKOutboundTransferResponse): boolean {
        this.logger.info(`Validating Retunred Quote with transfer response amount${transferResponse.amount}`);
        // todo: Define Implementations
        return true;
    }

    async updateSentTransfer(transferAccept: TAirtelUpdateSendMoneyRequest, transferId: string): Promise<TtransferContinuationResponse> {
        this.logger.info(`Updating transfer for id ${transferAccept.msisdn}`);

        if (!(transferAccept.acceptQuote)) {
            throw ValidationError.quoteNotAcceptedError();
        }

        const airtelRes = await this.airtelClient.collectMoney(this.getTAirtelCollectMoneyRequest(transferAccept, transferId));
        const sdkRes = await this.sdkClient.updateTransfer({
            acceptQuote: transferAccept.acceptQuote
        }, transferId);

        if(!(sdkRes.data.currentState === "COMPLETED")){
            await this.airtelClient.refundMoney({
                "transaction": {
                    "airtel_money_id": airtelRes.data.transaction.id,
                }
            });

            // todo: Define manual refund process
        }

        return sdkRes.data;
    }

    private getTAirtelCollectMoneyRequest(collection: TAirtelUpdateSendMoneyRequest, transferId: string): TAirtelCollectMoneyRequest {
        return {
            "reference": "string",
            "subscriber": {
                "country": this.airtelConfig.X_COUNTRY,
                "currency": this.airtelConfig.X_CURRENCY,
                "msisdn": collection.msisdn,
            },
            "transaction": {
                "amount": collection.amount,
                "country": this.airtelConfig.X_COUNTRY,
                "currency": this.airtelConfig.X_CURRENCY,
                "id": transferId,
            }
        };
    }



    // think of better way to handle refunding
    private async processUpdateSentTransferError(error: unknown, transaction: TFineractTransferDeps): Promise<never> {
        let needRefund = error instanceof SDKClientError;
        try {
            const errMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`error in updateSentTransfer: ${errMessage}`, { error, needRefund, transaction });
            if (!needRefund) throw error;
            //Refund the money
            const depositRes = await this.fineractClient.receiveTransfer(transaction);
            if (depositRes.statusCode != 200) {
                const logMessage = `Invalid statusCode from fineractClient.receiveTransfer: ${depositRes.statusCode}`;
                this.logger.warn(logMessage);
                throw new Error(logMessage);
            }
            needRefund = false;
            this.logger.info('Refund successful', { needRefund });
            throw error;
        } catch (err: unknown) {
            if (!needRefund) throw error;

            const details = {
                amount: parseFloat(transaction.transaction.transactionAmount),
                fineractAccountId: transaction.accountId,
            };
            this.logger.error('refundFailedError', { details, transaction });
            throw ValidationError.refundFailedError(details);
        }
    }
}
