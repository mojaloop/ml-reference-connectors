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

 --------------
 ******/

'use strict';

import config from '../config';
import {
    ITNMClient,
    PartyType,
    TMakePaymentRequest,
    TNMConfig,
    TNMError,
    TNMSendMoneyRequest,
    TNMSendMoneyResponse,
} from './CBSClient';
import {
    ILogger,
    TLookupPartyInfoResponse,
    TQuoteResponse,
    TQuoteRequest,
    TtransferResponse,
    TtransferRequest,
    ICoreConnectorAggregate,
    TtransferPatchNotificationRequest,
    TupdateSendMoneyDeps,
    ValidationError,
} from './interfaces';
import {
    ISDKClient,
    TtransferContinuationResponse,
} from './SDKClient';

export class CoreConnectorAggregate implements ICoreConnectorAggregate {
    IdType: string;
    logger: ILogger;
    DATE_FORMAT = 'dd MM yy';

    constructor(
        readonly sdkClient: ISDKClient,
        readonly tnmClient: ITNMClient,
        readonly tnmConfig: TNMConfig,
        logger: ILogger,
    ) {
        // todo: set the IdType from here
        this.IdType = "MSISDN";
        this.logger = logger;
    }

    //Payee
    async getParties(id: string, idType: string): Promise<TLookupPartyInfoResponse> {
        this.logger.info(`Get Parties for ${id}`);
        if (!(idType === this.tnmClient.tnmConfig.SUPPORTED_ID_TYPE)) {
            throw ValidationError.unsupportedIdTypeError();
        }

        const lookupRes = await this.tnmClient.getKyc({ msisdn: id });
        const party = {
            data: {
                displayName: `${lookupRes.data.full_name}`,
                firstName: lookupRes.data.full_name,
                idType: this.tnmClient.tnmConfig.SUPPORTED_ID_TYPE,
                idValue: id,
                lastName: lookupRes.data.full_name,
                middleName: lookupRes.data.full_name,
                type: PartyType.CONSUMER,
                kycInformation: `${JSON.stringify(lookupRes)}`,
            },
            statusCode: 200,
        };
        this.logger.info(`Party found`, { party });
        return party;
    }

    async quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Quote requests for ${this.IdType} ${quoteRequest.to.idValue}`);
        if (quoteRequest.to.idType !== this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }

        if (quoteRequest.currency !== config.get("tnm.TNM_CURRENCY")) {
            throw ValidationError.unsupportedCurrencyError();
        }

        const res = await this.tnmClient.getKyc({
            msisdn: quoteRequest.to.idValue,

        });
        //TODO: Implement bar checking
        if (res.message != "Completed successfully") {
            throw TNMError.payeeBlockedError("Account is barred ", 500, "5400");
        }

        const serviceCharge = config.get("tnm.SERVICE_CHARGE");

        this.checkAccountBarred(quoteRequest.to.idValue);

        const quoteExpiration = config.get("tnm.EXPIRATION_DURATION");
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

    //TODO: Check actual response for barred accounts
    private async checkAccountBarred(msisdn: string): Promise<void> {
        const res = await this.tnmClient.getKyc({ msisdn: msisdn });
        if (res.message != "Completed successfully") {
            throw ValidationError.accountBarredError();
        }
    }

    async receiveTransfer(transfer: TtransferRequest): Promise<TtransferResponse> {
        this.logger.info(`Received transfer request for ${transfer.to.idValue}`);
        if (transfer.to.idType != this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }

        if (transfer.currency !== config.get("tnm.TNM_CURRENCY")) {
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

    async updateTransfer(updateTransferPayload: TtransferPatchNotificationRequest, transferId: string): Promise<void> {
        this.logger.info(`Committing transfer on patch notification for ${updateTransferPayload.quoteRequest?.body.payee.partyIdInfo.partyIdentifier} and transfer id ${transferId}`);
        if (updateTransferPayload.currentState !== 'COMPLETED') {
            throw ValidationError.transferNotCompletedError();
        }
        if (!this.validatePatchQuote(updateTransferPayload)) {
            throw ValidationError.invalidQuoteError();
        }

        const makePaymentRequest: TMakePaymentRequest = this.getMakePaymentRequestBody(updateTransferPayload);
        await this.tnmClient.makepayment(makePaymentRequest)

    }


    private getMakePaymentRequestBody(requestBody:TtransferPatchNotificationRequest) : TMakePaymentRequest{
        if (!requestBody.quoteRequest) {
            throw ValidationError.quoteNotDefinedError('Quote Not Defined Error', '5000', 500);
        }

        return {
            "msisdn" : requestBody.quoteRequest.body.payee.partyIdInfo.partyIdentifier,
            "amount": requestBody.quoteRequest.body.amount.amount,
            "transaction_id":requestBody.quoteRequest.body.transactionId,
            "narration": requestBody.quoteRequest.body.note !== undefined ? requestBody.quoteRequest.body.note : "No note returned"
        }
    }


    private validatePatchQuote(transfer: TtransferPatchNotificationRequest): boolean {
        this.logger.info(`Validating code for transfer with state ${transfer.currentState}`);
        // todo define implmentation
        return true;
    }


    // Payer
    sendMoney(transfer: TNMSendMoneyRequest): Promise<TNMSendMoneyResponse> {
        this.logger.info(`${transfer.payeeId}`);
        throw new Error('Method not implemented.');
    }
    updatesendMoney(updateSendMoneyDeps: TupdateSendMoneyDeps): Promise<TtransferContinuationResponse> {
        this.logger.info(`${updateSendMoneyDeps.transferId}`);
        throw new Error('Method not implemented.');
    }
}
