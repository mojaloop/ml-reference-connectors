# Payee Get Parties for MTN
This sequence diagram shows the requests involved in a typical discovery call from the mojaloop connector the DFSP core connector.  There are 3 actors involved in the process i.e
- Mojaloop Connector, the mojaloop connection middleware
- Core Connector, the core connector that interfaces the mojaloop connector to the core banking apis
-  MTN , the core banking solution api of the DFSP being connected.

At every request step there are some checks performed by the core connector to ensure the transaction is successful.

# Description
The process starts when the Mojaloop Connector sends an account lookup request to the core connector at stage `1`. The core connector checks the request parameters to see if they are valid and are consistent with allowed values and data types. If the checks fail, at stage `3`, an error response is sent back to the Mojaloop Connector. The core connector at stage `4` then makes a request to the MTN Momo Api to make an account discovery call to make sure find out KYC data about the owner of the received account identifier value. The MTN Momo Api returns a response, some checks are performed and the party information is returned at stage `10` back to the Mojaloop Connnector

```mermaid
sequenceDiagram
  autonumber
  ML Connector->>CC: GET /parties/{idType}/{idValue}
  CC->>CC:Validation Checks , Check idType
  Alt If Checks fail
  CC-->>ML Connector: Response 400
  End
  CC->>MTN:GET /collection/v1_0/accountholder/{accountHolderIdType}/{accountHolderId}/basicuserinfo
  MTN-->>CC: Response
  CC->>CC:Response Check
  Alt If Response is Not Successful
  CC-->>ML Connector: Response 500
  End
  Alt If No Party found
  CC-->>ML Connector: Response 404
  End
  CC->>CC: Prepare Response
  CC-->>ML Connector: Response 200{}
```