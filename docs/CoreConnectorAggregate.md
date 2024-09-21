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
    updateSendMoney(updateSendMoneyDeps: TupdateSendMoneyDeps): Promise<TtransferContinuationResponse>
}
```

# Payee Integration
The payee integration functions are majorly three. These are the most important functions that need to be implemented by the core connector aggregate class. They are;
- Get Parties / Account Lookup
- Quote Requests / Agreement 
- Transfers 
- PUT Notification.

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
6          return this.preparePartyResponse(res);
7      }
8      ...
9  }
```
The function call on line `3` is the one that retreives information from the dfsp's core banking system api about the customer whose `id` is being passed into the function. On line `6` we pass the response from line `6` into a function that prepares a response for get parties that is structurally compliant with what the mojaloop connector expects. The structure of the response can be found in the [mojaloop backend api specification](https://mojaloop.github.io/api-snippets/?urls.primaryName=SDK%20Backend%20v2.1.0). 

It is expected that `this.cbsClient.getCustomerInfo` will retrieve customer information from the core banking solution api and return it into the `res` variable. For more information about the `cbsClient` please refer to the documentation on [CBS](./CBSClient.md) clients.

# Quote Requests.
This aggregate function is supposed to calculate the fees it will cost for a customer who is trying to make a payment into a beneficiaries account for a certain amount of money.

This function will vary from DFSP to DFSP because different DFSPs have different pricing models for how much it costs to transfer funds to a beneficiaries account. Consider reading through the [integration accounts](./IntegrationAccounts.md) documentation to understand how fees may come incoming payments.

The agreement request will come from the mojaloop connector in this format. The request body structure can be found in the mojaloop connector backend api specification under Quotes. Check the [Payee Integration](#payee-integration) section for a ink to the api specification.

```bash
POST /quoterequests
{
  "homeR2PTransactionId": "string",
  "amount": "string",
  ...more
}
```
The request body contains the the `amount` to be transferred. You can base on this value in the request body to calculate the fees it will cost to transfer the given amount into the beneficiaries account.

The quoter requests function would typicall look like this from a high level

```typescript
1  export class CoreConnectorAggregate implements ICoreConnectorAggregate {
2      ...
3      async quoterequests(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
4          // perform checks.
5          const res = this.calculateQuoteFees(quoteRequest);
6          return this.prepareQuoteResponse(res);
7      }
8      ...
9  }
```

The function call on line `5` is performing a fees calculation based on the transfer amount inorder determine transfer fees for the stated amount. The prepareQuoteResponse call on line `6` prepares a response object to be returned to the mojaloop connector. This reponse object must be structurally compliant with what is specified in the backend api specification.

It is expected that `this.calculateQuoteFees` is a function that has an implementation that calculates the transfer fees for the amount in the quote request body.

# Transfers
This function initiates the crediting of funds into the beneficiary customer's account. This function will initiate a process of crediting funds into a beneficiaries account. 

In this function we'll need to perform some validation checks on the account of the beneficiary and make sure it can receive funds. Depending os the dfsp, this information may or may not be available to be accessed from the api.

The request will come from the core connector and it will look like this. You will need to perform checks on the returned quote to make sure that quote is consistent with the transfer amounts.

```bash
POST /transfers
{
  "homeR2PTransactionId": "string",
  "amount": "string",
  ...more
}
```
The transfers aggregate function can look like this.

```typescript
1  export class CoreConnectorAggregate implements ICoreConnectorAggregate {
2      ...
3      async receiveTransfer(transfer: TtransferRequest): Promise<TtransferResponse>  {
4          // perform checks on transferRequest obj
6          return this.prepareTransferResponse(res);
7      }
8      ...
9  }
```
It is important to note that at this point, we don't do the acutal crediting of funds into the beneficiary's account. This is done when the core connector recieves a PUT notification about the transfer `currentState` which is described in the next section

# PUT Transfer Notification
This aggregate function is supposed to handle a PUT request that is a notification from the mojaloop scheme about the status of a transfer. 

The PUT Notification request looks like this. The UUID at the end of the URL path is the transfer ID. You can use this id in requests to the core banking solution api as ways to identify transactions and also for transaction traceability.

```bash
PUT /transfers/9c6d2d68-d658-4d0a-9597-8efbdee3f4dc
{
  "currentState": "COMPLETED",
  "direction": "INBOUND",
  ...more
}
```

When the core connector receives this request, it needs to check if the `currentState`. If this attribute is not `COMPLETED`, then something happened and the transfer could not be completed. So the disbursement into the customer's account should not be credited.

The function would take on a structure like this.

```typescript
1  export class CoreConnectorAggregate implements ICoreConnectorAggregate {
2      ...
3      async updateTransfer(updateTransferPayload: TtransferPatchNotificationRequest, transferId: string): Promise<void> {
4          if(transfer.currentState !== 'COMPLETED'){
5                throw new Error("Transfer not Completed");  
6            }
7          //perform checks
8          const res = await this.cbsClient.creditBeneficiaryAccount(updateTransferPayload,transferId);
10      }
11     ...
12  }
```

We can only credit the customer's account when we receive a put notification whose current state is `COMPLETED`. Otherwise, we must return an error response to the mojaloop connector.

# Payer Integration.
The payer integration functions are majorly 2. These are the most important functions that need to be implemented by the core connector aggregate class. They are;
- Send Money
- Update Send Money


# Important Considertion.
The payer integration is not as straight forward as payee integrations. The biggest question that needs to be answered which is by the DFSP is "How will payments be triggered from their application?". This question is important to ask because different DFSPs have different channels through which their customers interact with their payment platforms.

Assuming a payment channel has been chosen from which requests will be triggered to the core connector read below to see how the two functions should be implemented in the aggregate.

# Send Money
This is the aggregate function that initiates the process of sending money from a DFSP's customer to a beneficiary in another DFSP. This bit of the integration is what will allow the customers initiate outgoing payments to beneficiaries in other DFSPs in the payment scheme. This function is supposed to respond to conversion terms returned by the mojaloop connector. It is supposed to accept or decline them. It is then supposed to return a quote to the DFSP. The DFSP will then show it to the customer who is trying to make the payment. 

The quote returned by this function, will contain the fees for transfering an amount and name of the intended beneficiary. 

> When showing the fees to the customer, the DFSPs own fees should also be commnicated to the customer. This is to align with the Level One Principles of fees transparency.

After showing the customer the fees, they will decided depending on the fees whether to proceed with the transaction or not. Once they respond with a choice, the function that will handle that request is the `Update Send Money`


This Send money is already implemented in the core connector template and may not need any refactoring since the flow is the same for all integrations. The bulk of the work must be done at the DFSP application to get a customer journey developed.

# Customer Journey for DFSP Application
An application through which customers initiate payments from is required to have a successful payment initiation. Here is a proposed customer journey that can be adapted and modified as needed depending on the needs of the specific integration

- Customer opens the app and clicks on `Make COMESA Payment`
- Customer is presented with a form to enter the account identifier of the person to whom they are sending the funds.
- Customer specifies destination country and DFSP
- Customer specifies the amount to be sent and clicks `SUBMIT`
- The application initiates a `POST /send-money` request to the core connector in the background and responds with a quote to show the fees and how much the payee will recieve in their receive currency.
- The customer either chooses to click `CONTINUE` or `ABORT` and the application notifies that the request is being processed
- The application then sends a `PUT /send-money/{id}` request to the core connector to capture the customer's feedback. Depending on whether the customer accepted the terms of the transfer or not, the core connector will either initiate debit on the customer's account or just abort the transfer
- When the processing is complete, notify the customer either by email or SMS about the outcome of the transfer request.

# Update Send Money

# Errors

# Conclusion