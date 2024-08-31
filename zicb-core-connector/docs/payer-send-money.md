```mermaid
sequenceDiagram
  autoNumber
  Bank App ->> CC: POST /send-money/ {}
  CC->>CC: Check Currency
  Alt if Checks fail
  CC-->>Bank App: Response 400
  End
  CC->>ML Connector: POST /transfer /{}
  ML Connector-->>CC: Response
  CC->> CC: Check Response
  Alt if Checks fail
  CC-->>Bank App: Response 500
  End

  Alt if WAITING_FOR_CONVERSION_ACCEPTANCE
  ML Connector-->>CC: Response: ConversionRate
  CC->>CC: Check Conversion Terms
  Alt if Conversion Terms are invalid
  CC->>ML Connector: PUT /transfers/{id}[aceeptConversion: false]
  CC-->> Bank App: Response 500
  End
  CC->>ML Connector: PUT /transfers/{id}[aceeptConversion: true]
  ML Connector-->>CC:Response, Normal Quote
  Alt if response not successful
  CC-->>Bank App: Response 500
  End
  CC->>CC: Check Returned Quote
  Alt if Quote is incorrect
  CC-->>Bank App: Response 500
  End
  CC-->>Bank App: Response 200
  Bank App->>Bank App:Show terms of transfer to customer
  End
```
