# Error Handling
Whenever an exception is while handling a request, the exception is checked to see that has an `httpCode`, `mlCode` and a `message`. If it has all these set, we return a response with this structure.

The http status code will be the error object's `httpCode` attribute. The `mlCode` and `message` are serialized into a json object that has this structure.

```json
{
    "mlCode":"4000",
    "message": "Something wrong happened"
}
```
The mlCode is an fspiop compliant error code that can be got from the mojaloop [documentation](https://docs.mojaloop.io/api/fspiop/logical-data-model.html#error-codes)

Every module in `src/domain` has it's own error class. But all of them extend a `BasicError` class. For more information about the errors, read through the errors section of the [SDK Client](./SDKClient.md) and [CBS Client](./CBSClient.md) documentation.

To return an error response to for a particular request, just throw an exception and set the message, mlCode and httpCode and the core connecotor wrapper code will handle the return of the http response.
