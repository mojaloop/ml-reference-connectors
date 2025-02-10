# Payee Quote requests for this DFSP

This sequence diagram shows the requests involved in a typical transfer agreement phase from the mojaloop connector to the DFSP core connector. This stage involves the mojaloop connector inquiring from the DFSP how much it will cost to perform a particular transaction. There are 3 actors involved in the process i.e
- ML Connector, the mojaloop connection middleware
- CC, the core connector that interfaces the mojaloop connector to the core banking apis
- CBS Api, the core banking solution api of the DFSP being connected.

At every request step there are some checks performed by the core connector to ensure the transaction is successful.


# Description
The process starts when the Mojaloop Connector sends a request to the Core connector to calcuate the cost of a transaction at stage `1`. Some checks are performed to validate the request data and parameters and check whether the specified amount can actually be credited on the destination beneficiary. A service charge is calculated by the core connector and KYC information is requested to confirm the user account is not blocked. If all passes well, a response is sent containing the fees that will be associated with the transfer.

```mermaid
   sequenceDiagram
autoNumber
ML Connector ->> CC: POST /quote-requests /{}
Alt if required fields missing
CC-->>ML Connector: Response 400 Bad Rquest
End
CC->> CC:Validation Check, Quote Validation, Expiration Check
Alt if Id Type invalid
CC-->>ML Connector: Response 400 Bad Rquest
End
Alt if Currency Not Supported
CC-->>ML Connector: Response 500
End
CC->>CC: Check account can receive the specified amount
Alt if account cannot receive amount
CC-->>ML Connector: Response 500
End
CC->>CC:Calculate Charge
CC->> CBS Api:GET /api/{account_number} 
CBS Api -->> CC:Response
CC->>CC: Check Respomse
Alt if Response not Successful
CC-->>ML Connector: Response 500 ML Code: 5000
End
Alt if Account is barred
CC-->>ML Connector:Response 500: Ml Code :5400
End
CC-->>ML Connector: Repsonse 200
```
