 
```mermaid
  sequenceDiagram
  autoNumber
  
  Standard Bank Customer App->>Core Connector: Respond to transfer terms PUT /send-money/{id}/acceptQuote=true | false] 

  Core Connector->>Core Connector: Check acceptQuote

  Alt If Quote not Accepted
    Core Connector-->>Standard Bank Customer App: Response 500 OK
  End

  Core Connector->>Standard Bank API: Query DFSP endpoint for debiting an account

  Standard Bank API-->>Core Connector:Response

  Core Connector-->Core Connector: Check Response

  Alt If Couldnt make reservation
    Core Connector-->>Standard Bank Customer App: Response 500
  End

  Core Connector-->>Standard Bank Customer App: Response 202 Accepted

  Standard Bank API->>Core Connector: Callback Request

  Core Connector->>Core Connector: Check payment status 

  Alt If Transaction Successful
    Core Connector->>ML Connector:PUT  /transfers/{id} {acceptQuote = true}
  Else
    Core Connector->>ML Connector:PUT  /transfers/{id} {acceptQuote = false}
  End

  ML Connector-->>Core Connector: Response

  Core Connector->>Core Connector: Check response

  Alt if http error code 500 or 504 or currentState = ERROR_OCCURED
    Core Connector->>Standard Bank API : Query DFSP endpoint for refunding an account

    Standard Bank API-->>Core Connector:Check Response

    Alt if Response not Successful
      Core Connector->>Core Connector: Initiate manual refund
    End
  End

  Core Connector-->> Standard Bank API: Response 200
