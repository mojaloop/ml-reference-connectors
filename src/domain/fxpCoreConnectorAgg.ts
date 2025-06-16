import { IFXPClient, IFxpCoreConnectorAgg, TConfirmFxTransferRequest, TConfirmFxTransferResponse, TFxpConfig, TFxQuoteResponse, TFxQuoteRequest, TNotifyFxTransferStateRequest, TNotifyFxTransferStateResponse } from "./FXPClient";
import { ILogger } from "./interfaces";

export class FXPCoreConnectorAggregate<F> implements IFxpCoreConnectorAgg<F> {
    constructor(
        public fxpClient: IFXPClient,
        public logger: ILogger,
        public fxpConfig: TFxpConfig<F>
    ){}

    async getFxQuote(deps: TFxQuoteRequest): Promise<TFxQuoteResponse> {
        this.logger.info(`Calculating quote for fxQuote ${deps}`);  
        const fxQuote = await this.fxpClient.getFxQuote(deps);
        this.logger.info(`fxQuote response ${fxQuote}`);
        return fxQuote;
    }

    async confirmFxTransfer(deps: TConfirmFxTransferRequest): Promise<TConfirmFxTransferResponse> {
        this.logger.info(`Confirming fxQuote for fxTransfer ${deps}`);
        const transferConfirmation = await this.fxpClient.confirmFxTransfer(deps);
        this.logger.info(`fxTransfer response ${transferConfirmation}`);
        return transferConfirmation;
    }

   async notifyFxTransferState(deps: TNotifyFxTransferStateRequest): Promise<TNotifyFxTransferStateResponse> {
        this.logger.info(`Recieved fxTransfer Notification ${deps}`);
        await this.fxpClient.notifyFxTransferState(deps);
        this.logger.info(`fxTransfer notification passed to fxpBackend ${deps}`);
    }

}