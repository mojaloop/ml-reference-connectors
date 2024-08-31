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

import {
    ICbsClient,
    TCBSConfig,
    TCbsSendMoneyRequest,
    TCbsSendMoneyResponse,
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
} from './interfaces';
import {
    ISDKClient,
    TtransferContinuationResponse,
} from './SDKClient';

export class CoreConnectorAggregate implements ICoreConnectorAggregate {
    public IdType: string;
    private logger: ILogger;
    DATE_FORMAT = 'dd MM yy';

    constructor(
        private readonly sdkClient: ISDKClient,
        private readonly cbsClient: ICbsClient,
        private readonly cbsConfig: TCBSConfig,
        logger: ILogger,
    ) {
        // todo: set the IdType from here 
        this.IdType = "MSISDN";
        this.logger = logger;
    }
    getParties(id: string, IdType: string): Promise<TLookupPartyInfoResponse> {
        this.logger.info(`Getting party info ${id} ${IdType}`);
        this.cbsClient.getCustomer({
            property: id
        });
        throw new Error('Method not implemented.');
    }
    quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Calculating quote for ${quoteRequest.to.idValue}`);
        throw new Error('Method not implemented.');
    }
    receiveTransfer(transfer: TtransferRequest): Promise<TtransferResponse> {
        this.logger.info(`Received transfer request for ${transfer.to.idValue}`);
        throw new Error('Method not implemented.');
    }
    updateTransfer(updateTransferPayload: TtransferPatchNotificationRequest, transferId: string): Promise<void> {
        this.logger.info(`Committing transfer on patch notification for ${updateTransferPayload.quoteRequest?.body.payee.partyIdInfo.partyIdentifier} and transfer id ${transferId}`);
        throw new Error('Method not implemented.');
    }
    sendMoney(transfer: TCbsSendMoneyRequest): Promise<TCbsSendMoneyResponse> {
        this.logger.info(`${transfer.property}`);
        throw new Error('Method not implemented.');
    }
    updatesendMoney(updateSendMoneyDeps: TupdateSendMoneyDeps): Promise<TtransferContinuationResponse> {
        this.logger.info(`${updateSendMoneyDeps.transferId}`);
        throw new Error('Method not implemented.');
    }
}
