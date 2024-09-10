# Request Handling Lifecycle
When a request is received by the core connector, depending on which port the request is received, the core connector will use a specific api to handle the request. You can customise which api is used depending on the port that you set for the specific api. 

In the .env.example file, there are environment variables that can help influence which api is used depending on the port of receiving the request.

```bash
DFSP_SERVER_PORT=3004
SDK_SERVER_PORT=3003
DFSP_API_SPEC_FILE=./src/api-spec/core-connector-api-spec-dfsp.yml
SDK_API_SPEC_FILE=./src/api-spec/core-connector-api-spec-sdk.yml
``` 
This is a snippet of environment variables set in the .env.example file. According to this configuration, if requests are received on port 3004, the server will use the api set using `DFSP_API_SPEC_FILE` which is a path to an api specification. If requests are received on port 3003, the server will use the api set using `SDK_API_SPEC_FILE`.

Once a request is received, on a port, the request is handles by a an openapi-backend function. This function is configured with request handler functions that map to operationIds in the open api specification for that specific server.

When a request matches the URL in the api specification, openapi-backend will call the registered request handler that matches the operationId of that api resource. It will pass in the required parameters. The registered request handler is then supposed to then extract the required information from the request parameters and body. It is then supposed to call an aggregate function to be able to execute the required business logic to achieve the desired functionality.

For more infomation about how the open api specification is used and route handling, refer to [Routing and Api Specification](./RoutingAndApiSpecifications.md) documentation 

