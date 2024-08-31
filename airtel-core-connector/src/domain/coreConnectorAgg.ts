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
    PartyType,
    IAirtelClient,
    TAirtelDisbursementRequestBody,
    TAirtelConfig,
    TAirtelUpdateSendMoneyRequest,
    TAirtelCollectMoneyRequest,
    AirtelError,
    ETransactionStatus,
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
    TtransactionEnquiryDeps,
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
        private readonly sdkClient: ISDKClient,
        private readonly airtelConfig: TAirtelConfig,
        private readonly airtelClient: IAirtelClient,
        logger: ILogger,
    ) {
        this.IdType = airtelConfig.SUPPORTED_ID_TYPE;
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
        this.logger.info(`Quote requests for ${this.IdType} ${quoteRequest.to.idValue}`);
        if (quoteRequest.to.idType !== this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }

        if (quoteRequest.currency !== config.get("airtel.X_CURRENCY")) {
            throw ValidationError.unsupportedCurrencyError();
        }

        const res = await this.airtelClient.getKyc({
            msisdn: quoteRequest.to.idValue,

        });

        if (res.data.is_barred) {
            throw AirtelError.payeeBlockedError("Account is barred ", 500, "5400");
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

        const transferRequest: TSDKOutboundTransferRequest = await this.getTSDKOutboundTransferRequest(transfer);
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

    private async getTSDKOutboundTransferRequest(transfer: TAirtelSendMoneyRequest): Promise<TSDKOutboundTransferRequest> {
        const res = await this.airtelClient.getKyc({
            msisdn: transfer.payerAccount
        });
        return {
            'homeTransactionId': randomUUID(),
            'from': {
                'idType': this.airtelConfig.SUPPORTED_ID_TYPE,
                'idValue': transfer.payerAccount,
                'fspId': this.airtelConfig.FSP_ID,
                "displayName": `${res.data.first_name} ${res.data.last_name}`,
                "firstName": res.data.first_name,
                "middleName": res.data.first_name,
                "lastName": res.data.last_name,
                "merchantClassificationCode": "123",
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
        this.logger.info(`Getting response for transfer with Id ${transfer.transferId}`);
        return {
            "payeeDetails": {
                "idType": transfer.to.idType,
                "idValue":transfer.to.idValue,
                "fspId": transfer.to.fspId !== undefined ? transfer.to.fspId : "No FSP ID Returned",
                "firstName": transfer.to.firstName !== undefined ? transfer.to.firstName : "No First Name Returned",
                "lastName":transfer.to.lastName !== undefined ? transfer.to.lastName : "No Last Name Returned",
                "dateOfBirth":transfer.to.dateOfBirth !== undefined ? transfer.to.dateOfBirth : "No Date of Birth Returned",
            },
            "receiveAmount": transfer.quoteResponse?.body.payeeReceiveAmount?.amount !== undefined ? transfer.quoteResponse.body.payeeReceiveAmount.amount : "No payee receive amount",
            "receiveCurrency": transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency !== undefined ? transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency : "No Currency returned from Mojaloop Connector" ,
            "fees": transfer.quoteResponse?.body.payeeFspFee?.amount !== undefined ? transfer.quoteResponse?.body.payeeFspFee?.amount : "No fee amount returned from Mojaloop Connector",
            "feeCurrency": transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency !== undefined ? transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency : "No Fee currency retrned from Mojaloop Connector",
            "transactionId": transfer.transferId !== undefined ? transfer.transferId : "No transferId returned",
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
        this.logger.info(`Updating transfer for id ${transferAccept.msisdn} and transfer id ${transferId}`);

        if (!(transferAccept.acceptQuote)) {
            throw ValidationError.quoteNotAcceptedError();
        }
        const airtelRes = await this.airtelClient.collectMoney(this.getTAirtelCollectMoneyRequest(transferAccept, randomUUID())); // todo fix this back to have the transferId
      
        // Transaction id from response 
        const transactionEnquiry = await this.airtelClient.getTransactionEnquiry({
            transactionId: airtelRes.data.transaction.id
        });


        const sdkRes: THttpResponse<TtransferContinuationResponse> = await this.checkTransactionAndRespondToMojaloop({
            transactionEnquiry,
            transferId,
            airtelRes,
            transferAccept
        });

        // if (!(sdkRes.data.currentState === "COMPLETED")) { 
        //     await this.airtelClient.refundMoney({
        //         "transaction": {
        //             "airtel_money_id": airtelRes.data.transaction.id,
        //         }
        //     });

        //     // todo: Define manual refund process and uncomment this
        // }

        return sdkRes.data;
    }

    private async checkTransactionAndRespondToMojaloop(deps:TtransactionEnquiryDeps): Promise<THttpResponse<TtransferContinuationResponse>>{
        this.logger.info("Checking transaction and responding mojaloop");
        let sdkRes: THttpResponse<TtransferContinuationResponse> | undefined = undefined;
        let counter = 0;
        while (deps.transactionEnquiry.data.transaction.status === ETransactionStatus.TransactionInProgress || deps.transactionEnquiry.data.transaction.status === ETransactionStatus.TransactionAmbiguous) {
            this.logger.info(`Waiting for transaction status`);
            if(counter>1){
                this.logger.info(`Checking timed out. Transaction is unsuccessful,Responding with false`);
                sdkRes = await this.sdkClient.updateTransfer({
                    acceptQuote: true, //todo: fix back after demo
                }, deps.transferId);
                break;
            }
            // todo: make the number of seconds configurable
            await new Promise(r => setTimeout(r, this.airtelConfig.TRANSACTION_ENQUIRY_WAIT_TIME));
            deps.transactionEnquiry = await this.airtelClient.getTransactionEnquiry({
                transactionId: deps.airtelRes.data.transaction.id
            });

            if (deps.transactionEnquiry.data.transaction.status === ETransactionStatus.TransactionSuccess) {
                this.logger.info(`Transaction is successful, Responding with true`);
                sdkRes = await this.sdkClient.updateTransfer({
                    acceptQuote: deps.transferAccept.acceptQuote
                }, deps.transferId);
                break;
            } else if (deps.transactionEnquiry.data.transaction.status === ETransactionStatus.TransactionFailed) {
                this.logger.info(`Transaction is unsuccessful,Responding with false`);
                sdkRes = await this.sdkClient.updateTransfer({
                    acceptQuote: true, //todo: fix back after demo
                }, deps.transferId);
                break;
            } else if (deps.transactionEnquiry.data.transaction.status === ETransactionStatus.TransactionExpired) {
                this.logger.info(`Transaction is unsuccessful,Transaction has expired`);
                sdkRes = await this.sdkClient.updateTransfer({
                    acceptQuote: true, //todo: fix back after demo
                }, deps.transferId);
                break;
            }
            counter+=1;
        }
        if (!sdkRes) {
            throw SDKClientError.updateTransferRequestNotDefinedError();
        }
        return sdkRes;
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
                "amount": Number(collection.amount),
                "country": this.airtelConfig.X_COUNTRY,
                "currency": this.airtelConfig.X_CURRENCY,
                "id": transferId,
            }
        };
    }
}
