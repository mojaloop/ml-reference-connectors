## FXP fxTransfers Process

This sequence diagram shows the sequence of steps that happen between the mojaloop connector and FXP Core Connector when performing an fxTransfers request

### POST /fxTransfers 
Process used to check if the conversion terms that were quoted earlier are still valid to execute a transfer.

```mermaid
sequenceDiagram
    autonumber
    ML Connector ->> FXP Core Connector: POST /fxTransfers
    FXP Core Connector ->> FXP Core Connector: Validate request schema
    Alt if validation fails
    FXP Core Connector -->> ML Connector: Response 400
    End
    FXP Core Connector ->> FXP API: Check fxTransfers terms and confirm if still valid
    FXP API -->> FXP Core Connector: Response 200 {Confirmation}
    FXP Core Connector ->> ML Connector:  Response 200 {Confirm}
```

### PUT /fxTransfers/{commitRequestId}
Process used to notify the FXP backend about the terminal state of an fxTransfer. Either as `COMPLETED` or `ERROR_OCCURED`

```mermaid
sequenceDiagram
    autonumber
    ML Connector ->> FXP Core Connector: PUT /fxTransfers/{commitRequestId}
    FXP Core Connector ->> FXP Core Connector: Validate request schema
    Alt if validation fails
    FXP Core Connector -->> ML Connector: Response 400
    End
    FXP Core Connector ->> FXP API: Check fxTransfers Request and confirm
    FXP API -->> FXP Core Connector: Response 200 {Confirmation}
    FXP Core Connector ->> ML Connector:  Response 200 {Confirm}
```