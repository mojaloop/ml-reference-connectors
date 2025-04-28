# Core Connector Lib 
The core connector library contains all shared functionality for all core connectors. It significantly decreases the amount of effort needed to develop a core connector and it improves the developer experience.

The goal for connector development is that a developer will only need to implement an interface and provide configuration for connecting to a DFSP or an FXP.

# Installation
Install the core connector lib in your project

```bash
npm install @mojaloop/core-connector-lib
```

# Usage
To Build a connector using the core-connector-lib, you will need to do the following.
1. Create a type to define the configuration required by the client
2. Implement the `ICbsClient` interface for that specific DFSP or the `IFXPClient` interface for that specific FXP
3. Set environment variables to allow for the connector to pick them through `convict` via a configuration file.
4. Write tests to validate the functionality of the created client
5. Run the connector by calling `await coreconnector.start()`

## How to build a core connector !

Create a configuration `type` based on the parameters required to connect the financial institutions API(s) whether it is an FXP or DFSP.

```typescript
export type TBlueBankConfig = {
    BLUE_BANK_URL : string;
    BLUE_BANK_CLIENT_ID: string;
    BLUE_BANK_CLIENT_SECRET: string;
}
```
## DFSP
If you are building a DFSP core connector you need to implement the ICbsClient interface.

```typescript
export interface ICbsClient<C> {
    cbsConfig: TCBSConfig<C>;
    httpClient: IHTTPClient;
    logger: ILogger;
    getAccountInfo(deps: TGetKycArgs): Promise<Party>;
    getAccountDiscoveryExtensionLists(): TPayeeExtensionListEntry[];
    getQuote(quoteRequest: TQuoteRequest): Promise<TQuoteResponse>;
    reserveFunds(transfer: TtransferRequest): Promise<TtransferResponse>;
    commitReservedFunds(transferUpdate: TtransferPatchNotificationRequest): Promise<void>;
    handleRefund(updateSendMoneyDeps: TCBSUpdateSendMoneyRequest, transferId: string): Promise<void>;
}
```
For an example implementation, please refer to this [file](./examples/abc-ug-dfsp-core-connector/src/CBSClient.ts).

Each of those method implementations will vary depending on the DFSP or FXP. So it is important that you implement functionality that is custom to the DFSP.

## FXP 
If you are implementing a core connector for an FXP, you will need to implement the IFXPClient interface

```typescript 
export interface IFXPClient<C> {
    httpClient: IHTTPClient;
    logger: ILogger;
    fxpConfig: TFxpConfig<C>

    getFxQuote(deps: TFxQuoteRequest): Promise<TFxQuoteResponse>;
    confirmFxTransfer(deps: TConfirmFxTransferRequest): Promise<TConfirmFxTransferResponse>;
    notifyFxTransferState(deps: TNotifyFxTransferStateRequest): Promise<TNotifyFxTransferStateResponse>;
}
```

For an example implementation, please refer to this [file](./examples/abc-ug-fxp-core-connector/src/FXPClient.ts).

Each of those method implementations will vary depending on the DFSP or FXP. So it is important that you implement functionality that is custom to the DFSP.

## Configuration
