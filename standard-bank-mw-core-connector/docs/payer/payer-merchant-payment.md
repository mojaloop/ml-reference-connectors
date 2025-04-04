# Payer Initiate Merchant Payment.
This sequence diagram details the process of initiating a merchant payment and the steps the core connector takes to initiate an outbound transfer in the mojaloop connector.


```mermaid
sequenceDiagram
  autoNumber
  DFSP Customer App->>CC: POST /merchant-payment/ {}
  CC->>CC: Check Request
  Alt if Checks fail
  CC-->>DFSP Customer App: Response 400
  End
  CC->>ML Connector: POST /transfer /{amountType: RECEIVE} 
  ML Connector-->>CC: Response
  CC->> CC: Check Response
  Alt if Checks fail
  CC-->>DFSP Customer App: Response 500
  End

  Alt if WAITING_FOR_QUOTE_ACCEPTANCE
  CC->>CC: Check returned Quote
  Alt if Quote is invalid
  CC->>ML Connector: PUT /transfers/{id}[acceptQuote: false]
  CC-->>DFSP Customer App: Response 500
  End
  CC->>ML Connector: PUT /transfers/{id}[acceptQuote: true]
  End
  ML Connector-->>CC:Response,  fxQuote
  Alt if response not successful
  CC-->>DFSP Customer App: Response 500
  End
  CC->>CC: Check Conversion Terms
  Alt if Conversion invalid
  CC-->>DFSP Customer App: Response 500
  End
  CC-->>DFSP Customer App: Response 200
  DFSP Customer App->>DFSP Customer App: Show terms of transfer to customer
```
