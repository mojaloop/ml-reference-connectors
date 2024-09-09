# Core Connector Aggregate
All business logic is specified inside the core connector aggregate. The core connector aggregate is a class inside the `coreConnectorAgg.ts` file located inside the `src/domain` folder of the core connector template. This is where all the different pieces of the puzzles are tied together. The route handlers in the routes class invoke functions in the core connector aggregate class to execute functionality associated with a particular endpoint. The data returned by an aggregate function is returned to the route handler which in turn returns the data as a json response back to the client that made the request.

# Aggregate Attributes
The core connector aggregate requires some attributes to be able to execute it's functionality. It requires a CBS Client to be able to make requests to the core banking solution of the DFSP being created. It requires a logger to be able to log info messages on the console. It also requires an SDK Client to be able to make requests to the mojaloop connector. These attributes are specified as part of the aggregate class constructor. The core connector aggregate has functions that handle specific problems in a typical integration.

# Aggregate Interface
The core connector aggregate class implements an interface that specifies what methods the core connector should have and what attributes it must have. Here is the interface that the core connector aggregate implements.

```typescript
export interface ICoreConnectorAggregate  {
    sdkClient: ISDKClient;
    cbsClient: ICbsClient;
    cbsConfig: TCBSConfig;
    IdType: string;
    logger: ILogger;
    getParties(id: string, IdType: string):Promise<TLookupPartyInfoResponse>;
    quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse>;
    receiveTransfer(transfer: TtransferRequest): Promise<TtransferResponse>;
    updateTransfer(updateTransferPayload: TtransferPatchNotificationRequest, transferId: string): Promise<void>;
    sendMoney(transfer: TCbsSendMoneyRequest): Promise<TCbsSendMoneyResponse>
    updatesendMoney(updateSendMoneyDeps: TupdateSendMoneyDeps): Promise<TtransferContinuationResponse>
}
```

# Payee Integration
The payee integration functions are majorly three. These are the most important functions that need to be implemented by the core connector aggregate class. They are;
- Get Parties / Account Lookup
- Quote Requests / Agreement 
- Transfers 

For all payee related resources the api specification that must be referred to is the mojaloop connector backend api. This api is supposed to be implemented by the core connector such that the mojaloop connector can be able to make requests to the core connector to execute incoming transfers into the DFSP. For more information about the api specification for the mojaloop connector backend api, follow this [link](https://mojaloop.github.io/api-snippets/?urls.primaryName=SDK%20Backend%20v2.1.0).

# Get Parties
This function is intended to handle all account inquiry requests from the mojaloop connector. When the mojaloop connector makes an account inquiry api call to the core connector, the core connector will receive the request on a specific port. If there is a registered route handler function for get parties, the request will be received by the function. The get parties request from the mojaloop connector would typically look like this.

```BASH
#GET /parties/{IdType}/{IdValue}
HTTP 1.1 GET /parties/MSISDN/8993345533
```
The request handler function is then supposed to call the aggregate function for get parties. The get parties function should retrieve account information about the the IdValue specified in the URL parameters.

Typically the Get Parties aggregate function will look like this but can be refactored to support additional functionality.

```typescript
1  export class CoreConnectorAggregate implements ICoreConnectorAggregate {
2      ...
3      async getParties(id: string, IdType: string): Promise<TLookupInfoResponse> {
4          // perform checks.
5          const res = await this.cbsClient.getCustomerInfo(id);
6          return this.prepareMojaloopResponse(res);
7      }
8      ...
9  }
```
The function call on line `3` is the one that retreives information from the dfsp's core banking system api about the customer whose `id` is being passed into the function. On line `6` we pass the response from line `6` into a function that prepares a response for get parties that is structurally compliant with what the mojaloop connector expects. The structure of the response can be found in the [mojaloop backend api specification](https://mojaloop.github.io/api-snippets/?urls.primaryName=SDK%20Backend%20v2.1.0). 

It is expected that `this.cbsClient.getCustomerInfo` will retrieve customer information from the core banking solution api and return it into the `res` variable. For more information about the `cbsClient` please refer to the documentation on [CBS](./CBSClient.md) clients.

# Quote Requests.
This aggregate function is supposed to calculate the fees it will cost for a customer who is trying to make a payment into a beneficiaries account for a certain amount of money.

This function will vary from DFSP to DFSP because different DFSPs have different pricing models for how much it costs to transfer funds to a



