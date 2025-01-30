# Payer Initiate Merchant Payment 
This sequence diagram details the process of initiating a merchant payment and the steps the core connector takes to initiate a payment in the mojaloop connector.

```mermaid
sequenceDiagram
  autoNumber
  Airtel App->>CC: POST /merchant-payment/ {}
  CC->>CC: Check Request
  Alt if Checks fail
  CC-->>Airtel App: Response 400
  End
  CC->>ML Connector: POST /transfer /{amountType: RECEIVE} 
  ML Connector-->>CC: Response
  CC->> CC: Check Response
  Alt if Checks fail
  CC-->>Airtel App: Response 500
  End

  Alt if WAITING_FOR_CONVERSION_ACCEPTANCE
  ML Connector-->>CC: Response: ConversionRate
  CC->>CC: Check Conversion Terms
  Alt if Conversion Terms are invalid
  CC->>ML Connector: PUT /transfers/{id}[acceptConversion: false]
  CC-->>Airtel App: Response 500
  End
  CC->>ML Connector: PUT /transfers/{id}[acceptConversion: true]
  End
  ML Connector-->>CC:Response, Normal Quote
  Alt if response not successful
  CC-->>Airtel App: Response 500
  End
  CC->>CC: Check Returned Quote
  Alt if Quote is incorrect
  CC-->>Airtel App: Response 500
  End
  CC-->>Airtel App: Response 200
  Airtel App->>Airtel App:Show terms of transfer to customer
```