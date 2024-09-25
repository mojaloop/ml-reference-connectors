# Airtel Core Connector 

# Introdution
This connection facilitates communication between Airtel and the Mojaloop Payment Manager. It processes incoming requests from Airtel and routes them to the payment manager. It was created using the [Core Connector Template](../core-connector-template/). 

# Integration Accounts
These are accounts that are used for dispursing and collecting money in Airtel.
- Dispursing Account:  This COMESA account receives funds and disburses them to individual payer accounts. It serves as the primary entry point for funds, which are then distributed to respective accounts through the receive transfer request.
- Collections Account: This account collects money when a payer initiates a send money request. Funds are transferred from the individual payer's account to the COMESA Collections Account..

# Deployment Configuration .env
These are Airtel Configurations needed for connection. There are found in the [env.example](.env.example)

- <b>AIRTEL_BASE_URL</b> : This is the base url for airtel uat environment 
- <b>CLIENT_ID</b>: According to Airtel Documentation,  The client_id is a public identifier for apps. It must also be unique across all clients that the authorization server handles. This is equivalent to consumer key displayed under keys section of application listing.
- <b>CLIENT_SECRET</b>  : According to Airtel Documentation,  The client_secret is a secret known only to the application and the authorization server.This is equivalent to consumer secret displayed under keys section of application
- <b>GRANT_TYPE</b>:  According to Airtel Documentation, The Client Credential grant type is used by confidential and public clients to fetch access token. 
- <b>X_COUNTRY</b> :Specifies the country where Airtel is being used (i.e, Zambia)

- <b>X_CURRENCY</b> : Specifies the currency used (i.e., ZMW)
- <b>SUPPORTED_ID_TYPE</b> : The supported ID type beinf used. Airtel used MSISDN.
- <b>SERVICE_CHARGE</b>: Service charge for receiving money into an Airtel account.
- <b>EXPIRATION_DURATION</b>: Time limit for sending money before a quote expires.
- <b>AIRTEL_PIN</b> : Pin used for Airtel Disbursements.
- <b>TRANSACTION_ENQUIRY_WAIT_TIME</b>: Time interval for checking transaction enquiries.
- <b>FSP_ID</b>: Unique ID for every Core Connector built for each DFSP (i.e, airtelzambia)



# Development 
To run the project clone the repository into your local machine
```bash
git clone https://github.com/mojaloop/ml-reference-connectors
```

Change directory into the project folder
```bash
cd ml-reference-connectors
```


# Set node version

```bash
nvm use
```

# Install dependencies

```bash
npm install
```

# Build 
```bash
npm run build
```

# Run 
```bash
npm run start
```

# Functional Tests

```bash
npm run test:functional
```
# Unit Tests

```bash
npm run test:unit
```
# Build and Run

```bash
npm run start:build
```
# Run with Docker

```bash
docker compose -f ./test/func/docker-compose.yml up -d
```
# Tear down Docker

```bash
docker compose -f ./test/func/docker-compose.yml down
```
