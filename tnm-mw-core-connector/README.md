# TNM Core Connector

## Introduction
The TNM Core connector connects to the Mojaloop Connector to facilitate payments across the COMESA member states. It provides the flexibility of transacting in your local currency and the receiving party in their local currency as well.

## Integration Accounts
Comesa


## Deployment Configurations

### Server Configurations
- **DFSP Server Host**: `0.0.0.0`
  This allows the DFSP server to be accessible from any network interface.
- **DFSP Server Port**: `3004`
  The DFSP server will run on port `3004`.
- **SDK Server Host**: `0.0.0.0`
  This allows the SDK server to be accessible from any network interface.
- **SDK Server Port**: `3003`
  The SDK server will run on port `3003`.

### API Specifications
- **DFSP API Spec File**: `./src/api-spec/core-connector-api-spec-dfsp.yml`
  Path to the API specification file for the DFSP.
- **SDK API Spec File**: `./src/api-spec/core-connector-api-spec-sdk.yml`
  Path to the API specification file for the SDK.

### Connector URLs
- **SDK Base URL**: `http://localhost:4010`
  Base URL for the SDK connector.

## Development

- **Run**:
  `npm run start:build`

- **Unit tests**:
  `npm run test:unit`

- **Integration tests**:
  Run SDK mock:
  `npm run test:int`

