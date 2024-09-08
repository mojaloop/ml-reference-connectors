# CBSClient
This is class that implements the ICbsClient interface. it has the actual methods that make the api calls to the DFSP. This file and class name should have the actual CBS name post-fixed, i.e 
```bash
AirtelClient
```
There is a routes objects that has the actual routes used by the DFSP in the url. if to make api call to get customer KYC is <em>/getParties/v1/users</em>, then the routes will look like

```typescript
export const CBS_ROUTES = Object.freeze({
    getparties: '/getParties/v1/users'
    });
```
In the CC template this is the one provided with generic route examples. These will definetly change from DFSP to DFSP.

```typescript
export const CBS_ROUTES = Object.freeze({
    search: 'search',
    savingsAccount: 'savingsaccounts',
    clients: 'clients',
    charges: 'charges',
});
```

The names of the methods should be the same or similar to how the api call name is documented according to that DFSP. i.e if the name of the api to get customer information is <em>'Verify Customer by Account Number'</em> , the method name shoud be:  

```
verifyCustomerByAccountNumber
```

All the methods in this class are asynchronous and should be defined with a:
```typescript
async verifyCustomerByAccountNumber
```

The methods must have a logger, explaining what the method does at that point in time, i.e:
```typescript
this.logger.info("Getting KYC from DFSP");
```

A constant variable usually named <em>url</em> is created to be used in the http call, i.e:
```typescript
 const url = `https://${this.cbsConfig.CBS_BASE_URL}${CBS_ROUTES.getParties}`;
```

A try block is then opened to make an http request and catch an error if anython goes wrong.i.e

```typescript
 try {
            const res = await this.httpClient.get<TCbsKYCRequest>(url);
            
            if (res.data.status.code !== '200') {
                this.logger.error(`Failed to get KYC: ${res.statusCode} - ${res.data}`);
                throw CBSError.getKYCError();
            }
            return res.data;
        } catch (error) {
            this.logger.error(`Error getting KYC: ${error}`, { url, data: deps });
            throw error;
        }
```