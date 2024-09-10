# Configuration.
All configuration for any core connector should be put in environment variables. Environment variables are configured through the `.env.example` file in the root of the core connector template folder. Before using the .env.example file, you should create a .env file from it so that it can be used by the executing core connector process as a source of environment variables. Convict is the tool that is used in this repository for configuration management.

To learn more about convict as a tool, read through it's documentation on [npmjs](https://www.npmjs.com/package/convict)

# Configuration Types
Inside the src folder in the core connector folder, there is a configuration file `config.ts`. This configuration file is what is used to specify what configuration variables are required to run the server.

All configuration environment variables for a specific module must specified in a type before they are added to config.ts. Before adding any new environment variable, we must specify a type definition for the new environment variable.

# Adding a new Environment Variable
In `config.ts`, there is an interface that contains all typed configuration objects of the project called `IConfigSchema`. 

```typescript
interface IConfigSchema {
    server: {
        SDK_SERVER_HOST: string;
        SDK_SERVER_PORT: number;
        DFSP_SERVER_HOST: string;
        DFSP_SERVER_PORT: number;
    };
    sdkSchemeAdapter: {
        SDK_BASE_URL: string;
    }
    cbs:TCBSConfig;
}
```
Every attribute of the configuration interface has it's own set of typed properties that define the types of the environment variables that must be set at runtime.

The most relevant configuration object to DFSP integration is the `cbs` attribute of the `IConfigSchema` because it is intended to hold the configuration variables for the DFSP we are integrating.

Here is an example of how the `TCBSConfig` type can look like.

```typescript
export type TCBSConfig = {
    CBS_NAME: string;
    BASE_URL: string;
    API_USER: string;
    API_PASSWORD: string;
}
```

Depending on the information needed to connect to the DFSP , you can add config variable types to this configuration type as needed.

Whenever you add a new property to the config type for the cbs attribute, you will need to add it to the `config` object in `config.ts` because it implements the `IConfigSchema` interface otherwise typescript will throw an error.

For example to add all the attributes we have added to the `TCBSConfig` type we would add the values to the config object like this.

```typescript
const config = Convict<IConfigSchema>({
    //other sections above
    ... 
    cbs:{
        CBS_NAME: {
            doc: 'Name of the DFSP',
            format: String,
            default: null, // required
            env: 'CBS_NAME',
        },
        BASE_URL: {
            doc: 'BASE URL OF THE DFSP',
            format: String,
            default: null, // required
            env: 'BASE_URL',
        },
        API_USER: {
            doc: 'Api usename to authenticate with cbs api',
            format: String,
            default: null, // required
            env: 'API_USER',
        },
        API_PASSWORD: {
            doc: 'Api password to authenticate with cbs api',
            format: String,
            default: null, // required
            env: 'API_PASSWORD',
        },
    }
})
```

Make sure to set the format and env attributes for each of the configuration objects in config because the process will look for those configured env variables and present them in the configured format.

# Usage
To use enviroment variables in any file in the project, you should import the config object from `config.ts`

Example
```typescript
import config from '../config'; //depending on where you are importing from

console.log(config.get('server.SDK_SERVER_HOST')) // read the SDK_SERVER_HOST in the server object
```