# Core Connector Lib 
[![Git Releases](https://img.shields.io/github/release/mojaloop/ml-reference-connectors.svg?style=flat)](https://github.com/mojaloop/ml-reference-connectors/releases)
[![CircleCI](https://circleci.com/gh/mojaloop/ml-reference-connectors.svg?style=svg)](https://circleci.com/gh/mojaloop/ml-reference-connectors)

The core connector library contains all shared functionality for all core connectors. It significantly decreases the amount of effort needed to develop a core connector and it improves the developer experience.

The goal for connector development is that a developer will only need to implement an interface and provide configuration for connecting to a DFSP or an FXP.

# Installation
Install the core connector lib in your project

```bash
npm install -g @mojaloop/core-connector-lib
```
Installing this lib provides you a command `create-cc` which you can use to create new connectors. 

# Creating a new core connector
After installing the core connector lib, run this command in a directory of your choice to bootstrap a new core connector. 

```bash
create-cc -m dfsp -n mtn-zm-dfsp-cc
```
## CLI Options

- -m : the mode to use when bootstrapping. `dfsp` or `fxp`
- -n : connector name e.g

# Usage
To Build a connector using the core-connector-lib, you will need to do the following.
1. Create a type to define the configuration required by the client
2. Implement the `ICbsClient` interface for that specific DFSP or the `IFXPClient` interface for that specific FXP
3. Set environment variables to allow for the connector to pick them through `convict` via a configuration file.
4. Write tests to validate the functionality of the created client
5. Run the connector by calling `coreconnector.start()`

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
Depending on whether you are building a DFSP or an FXP core connector, you need to provide special configuration for each of the 2 cases. 

The core connector lib supports configuration management through a type that you need to create. This type needs to be a schema that represents all the configuration variables that are required by to connect to a Core Banking API of a DFSP or an FXP backend API of an FXP.

Create the type. 

```typescript
export type TBlueBankConfig = {
    BLUE_BANK_URL : string;
    BLUE_BANK_CLIENT_ID: string;
    BLUE_BANK_CLIENT_SECRET: string;
}
```

The library provides an interface for managing configuration in the connector being implemented. The interface takes in 2 required type parameters to allow you to specify custom type configuration for your FXP or DFSP core connector.

Here is the interface and how it is defined.
```typescript
export interface IConnectorConfigSchema<D, F> {
    server: {
        SDK_SERVER_HOST: string;
        CBS_NAME: string;
        SDK_SERVER_PORT: number;
        DFSP_SERVER_HOST: string;
        DFSP_SERVER_PORT: number;
        MODE: "dfsp" | "fxp";
    };
    sdkSchemeAdapter: {
        SDK_BASE_URL: string;
    };
    cbs?: TCBSConfig<D>;
    fxpConfig?: TFxpConfig<F>;
}
```

The two type parameters D and F specify types that contain configuration attributes specific to the DFSP or FXP connector being developed.

This interface is to be implemented to support configuration management. In the example connectors implemented using this lib, the configuration management tool used is `convict`.

For a DFSP, here is an example [file](./examples/abc-ug-dfsp-core-connector/config.ts) that has an implementation of the interface. 

## Starting the service
To start the service, you will need to create an instance of the CoreConnector class and call it's start method.

A factory method `coreConnectorFactory` has been created to be allow creation of the instance.

To understand the required parameters of the factory method, please refer [here](./src/CoreConnector.ts)

```typescript
export type TConnectorDeps<D,F> = {
    config: IConnectorConfigSchema<D,F>;
    cbsClient?: ICbsClient<D>;
    fxpClient?: IFXPClient<F>;
    sdkClient?: ISDKClient;
}

export const coreConnectorFactory = <D,F>(deps: TConnectorDeps<D,F>): CoreConnector<D,F> => {
    return new CoreConnector<D,F>(deps);
};
```

Here is an example usage.

```typescript
'use strict';

import { IHTTPClient, AxiosClientFactory, ILogger, loggerFactory, ICbsClient, coreConnectorFactory } from "@mojaloop/core-connector-lib";
import { dfspConfig, getDFSPConfig } from "./config";
import { MockCBSClient } from "./src/CBSClient";
import { ConnectorError } from "./src/errors";

// DFSP or FXP Type with vars specific to the DFSP or FXP
export type TBlueBankConfig = {
    BLUE_BANK_URL : string;
    BLUE_BANK_CLIENT_ID: string;
    BLUE_BANK_CLIENT_SECRET: string;
}

const httpClient: IHTTPClient = AxiosClientFactory.createAxiosClientInstance();
const logger: ILogger = loggerFactory({context: dfspConfig.server.CBS_NAME});


if(!dfspConfig.cbs){
    throw ConnectorError.cbsConfigUndefined("CBS Config Not defined. Please fix the configuration in config.ts","0",0);
}

const cbsClient: ICbsClient<TBlueBankConfig> = new MockCBSClient<TBlueBankConfig>(dfspConfig.cbs,httpClient,logger);
const coreConnector = coreConnectorFactory<TBlueBankConfig, never>({config: getDFSPConfig(),cbsClient: cbsClient});

// Start Core Connector
coreConnector.start()
```
