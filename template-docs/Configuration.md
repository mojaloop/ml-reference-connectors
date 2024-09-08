# Configuration.
All configuration for any core connector should be put in environment variables.

Environment variables are configured through the .env.example file in the root of this folder.

Before using the .env.example file, you should create a .env file from it so that it can be used by the executing core connector.

Convict is the tool that is used in this repository for configuration management.

## Procedure
- Create a TCBSConfig type
```typescript
export type TCBSConfig = {
    CBS_NAME: string;
}
```
- Update the IConfigSchema interface and config type which implements that interface in the [config.ts](../core-connector-template/src/config.ts) with the configuration which are int the .env.

```typescript
cbs:{
        CBS_NAME: {
            doc: 'Name of the DFSP',
            format: String,
            default: null, // required
            env: 'CBS_NAME',
        },
    }
```
- The implementation of this config file is used as follows:
```typescript
this.cbsConfig.CBS_NAME
```