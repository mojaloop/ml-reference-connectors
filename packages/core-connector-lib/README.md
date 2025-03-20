# Core Connector Library

A library of shared functionality for development of core connectors for the mojaloop connector.

## Pre-requisites
To build a core connector using this library, you need to be practically farmiliar with the following concepts.
- Docker Knowledge
- Open API knowledge
- Typescript

## Installation

Environment requirements
- Node and npm
- Typescript

Install the package
```bash
npm install @mojaloop/core-connector-lib --save-dev
```

## Usage
To build a core connector, all you have to do is the following
- Implement a CBS Client 
- Setup configuration env vars in `config.ts` and in the `.env.example` file
- Customize the `send-money-api.yaml` if neccessary
- (Optional) If you need to, you can override the implementation of the business logic under `aggregate.override.ts`

For a complete example connector implementation refer to the core connector at `examples/abc-ug-core-connector`

```typescript
// index.ts
import { getCBSClientInstance } from "./src/CBSClient/CBSClientFactory";
import {Connector} from "@mojaloop/core-connector-lib";

Connector.CBSClient = getCBSClientInstance();

Connector.start();
```