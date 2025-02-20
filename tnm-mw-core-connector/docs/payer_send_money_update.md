```mermaid
sequenceDiagram
  autoNumber
  TNM Application->>CC: POST /send-money/{id}/acceptQuote=true | false
  CC->>CC: Check acceptQuote
  Alt If Quote not Accepted
  CC-->>TNM Application: Response 500 OK
  End
  CC->>TNM API:POST /payments
  TNM API-->>CC:Response
  CC-->CC: Check Response
  Alt If Couldnt make reservation
  CC-->>TNM Application: Response 500
  End
  CC->>TNM API: GET  /payments/{id}
  Loop While transaction status is TIP
  CC->>CC: Delay for 2 seconds
  CC->>TNM API: GET  /payments/{id}
  Alt if status == TS
  CC->>ML Connector:PUT  /transfers/{id} {acceptQuote = true} and Break
  else if status == TF
  CC->>ML Connector:PUT  /transfers/{id} {acceptQuote = false} and Break
  End
  End
  ML Connector -->> CC: Response
  CC->>CC: Check Response
  Alt if http error code 500 or 504 or currentState = ERROR_OCCURED and acceptQuote=true
  CC->>TNM API : Rolback transfer POST /invoices/refund/{receipt_number}
  TNM API-->>CC:Check Response
  Alt if Response not Successful
  CC->>CC: Initiate manual refund
  End
  End
  CC-->>TNM Application: Response 200
```
