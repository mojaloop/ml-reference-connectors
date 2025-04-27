import "dotenv/config";
import { TCBSConfig } from "./domain/CBSClient";
import { TFxpConfig } from "./domain/FXPClient";

export interface IConnectorConfigSchema<D, F> {
    server: {
        SDK_SERVER_HOST: string;
        CBS_NAME: string;
        SDK_SERVER_PORT: number;
        DFSP_SERVER_HOST: string;
        DFSP_SERVER_PORT: number;
        DFSP_API_SPEC_FILE: string;
        SDK_API_SPEC_FILE: string;
        MODE: "dfsp" | "fxp";
    };
    sdkSchemeAdapter: {
        SDK_BASE_URL: string;
    }
    cbs?: TCBSConfig<D>;
    fxpConfig?: TFxpConfig<F>
}
