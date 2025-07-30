import { IFXPClient, IFxpCoreConnectorAgg, TConfirmFxTransferRequest, TConfirmFxTransferResponse, TFxpConfig, TFxQuoteResponse, TFxQuoteRequest, TNotifyFxTransferStateRequest, TNotifyFxTransferStateResponse } from "./FXPClient";
import { AggregateError, ILogger } from "./interfaces";

export class FXPCoreConnectorAggregate<F> implements IFxpCoreConnectorAgg<F> {
    constructor(
        public fxpClient: IFXPClient,
        public logger: ILogger,
        public fxpConfig: TFxpConfig<F>
    ){}

    async getFxQuote(deps: TFxQuoteRequest): Promise<TFxQuoteResponse> {
        this.logger.info(`Calculating quote for fxQuote ${deps}`); 
        this.checkQuoteAndAmountType(deps); 
        const fxQuote = await this.fxpClient.getFxQuote(deps);
        this.logger.info(`fxQuote response ${fxQuote}`);
        return fxQuote;
    }

    private checkQuoteAndAmountType(deps:TFxQuoteRequest ){
        if(deps.conversionTerms.amountType === "SEND"){
            if(!deps.conversionTerms.sourceAmount.amount){
                throw AggregateError.genericQuoteError("Source Amount undefined with amountType SEND","2000",400);
            }
        }else{
            if(!deps.conversionTerms.targetAmount.amount){
                throw AggregateError.genericQuoteError("Target Amount undefined with amountType RECEIVE","2000",400);
            }
        }
    }

    async confirmFxTransfer(deps: TConfirmFxTransferRequest): Promise<TConfirmFxTransferResponse> {
        this.logger.info(`Confirming fxQuote for fxTransfer ${deps}`);
        const transferConfirmation = await this.fxpClient.confirmFxTransfer(deps);
        this.logger.info(`fxTransfer response ${transferConfirmation}`);
        return transferConfirmation;
    }

   async notifyFxTransferState(deps: TNotifyFxTransferStateRequest, commitRequestId: string): Promise<TNotifyFxTransferStateResponse> {
        this.logger.info(`Recieved fxTransfer Notification ${deps}`);
        await this.fxpClient.notifyFxTransferState(deps, commitRequestId);
        this.logger.info(`fxTransfer notification passed to fxpBackend ${deps}`);
    }

}