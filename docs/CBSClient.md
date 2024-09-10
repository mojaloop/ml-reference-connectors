# Core Banking Solution (CBS) Client
The CBS Client is responsible for all communication between the core connector and the core banking solution.

If the financial service provider we were integrating is a Mobile Network Operator like airtel that has an open api, then the CBS Client would be responsible for making http requests to airtel's mobile money api.

The CBS Client is responsible for setting up request resources that are required to effectively communicate with the Core Banking Solution of the Financial Service Provider.

# CBS Client
The CBS Client is defined in a `CBSClient.ts` file located in `core-connector-template/src/domain/CBSClient`

The CBS Client is a typescript class that implements an interface that is special for every DFSP. This interface should be defined in the `types.ts` file so that the concrete class implements all methods of this interface.

Depending on whether the core banking solution api is RESTFUL, SOAP based or even GraphQL api, the CBS Client should implement an interface accordingly to effectively communicate with the Core Banking Solution the following functions
- Account Discovery
- Quote Calculation
- Crediting a customer's account for payee scenarios 
- Debiting a customer's account for payer scenarios

# Types
The CBS Client module has a types `types.ts` file that defines all types that are used in the CBS Client. It is important that all request and response bodies are typed to allow easy use of the returned entities when a programming the response and request handling logic. In this types file, you can specify enums, interfaces and normal types in typescript.

The CBS Client interface for the DFSP being integrated should be defined in this file.

Also the type to hold the configuration parameters for the CBS Client should also be created in this file.

An example of the configuration type can be like this.

```typescript
export type TCBSConfig = {
    BASE_URL: string;
    API_USER: string;
    API_KEY: string;
    SUPPORTED_CURRENCY : string;
}
```

This type will eventually be used in the configuration module to enforce which environment variables must be set at run time. 

To learn more about how configuration is managed in this template, please read through [Configuration](./Configuration.md).

All types in this file are typescript types. For more information on types in typescript, read more from [here](https://www.typescriptlang.org/docs/handbook/basic-types.html)
# Errors
All errors that are thrown with in the CBS Client should be implemented in the errors file `errors.ts`. 

The errors file contains a class that extends a `Basic Error` which defines the attributes all errors should have.

For every new error that needs to be implemented, add a new `static` method to the CBSError class and let it return a new instance of the CBSError class where you set the required attributes

Here is an example of a `CBSError` that extends the `Basic Error` and it's usage


```typescript
export class CBSError extends BasicError{
    static accountNotFoundError(message: string, httpCode: number, mlCode: string) {
        return new CBSError(message, {
            httpCode: httpCode,
            mlCode: mlCode,
        });
    }
}
```

Usage

```typescript
if(response.status !== 200){
    throw CBSError.accountNotFoundError("Account Not Found during account lookup",404,"3200")
}
```

For more information about what Mojaloop Error codes to return for what error cases, please refer to this [documentation](https://docs.mojaloop.io/api/fspiop/logical-data-model.html#error-codes)

# Factory
The CBS Client Factory is a class that has a static method that is used for creating instances of the CBS Client class.

It is a manifestation of the factory design pattern.