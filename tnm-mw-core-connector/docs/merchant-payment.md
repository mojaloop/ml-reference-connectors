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

  Alt if WAITING_FOR_CONVERSION_ACCEPTANCE
  ML Connector-->>CC: Response: ConversionRate
  CC->>CC: Check Conversion Terms
  Alt if Conversion Terms are invalid
  CC->>ML Connector: PUT /transfers/{id}[aceeptConversion: false]
  CC-->>DFSP Customer App: Response 500
  End
  CC->>ML Connector: PUT /transfers/{id}[aceeptConversion: true]
  End
  ML Connector-->>CC:Response, Normal Quote
  Alt if response not successful
  CC-->>DFSP Customer App: Response 500
  End
  CC->>CC: Check Returned Quote
  Alt if Quote is incorrect
  CC-->>DFSP Customer App: Response 500
  End
  CC-->>DFSP Customer App: Response 200
  DFSP Customer App->>DFSP Customer App:Show terms of transfer to customer
