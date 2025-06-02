import { BasicError } from "../domain";

export class ServiceError extends BasicError{
    static invalidConfigurationError(message: string,mlCode: string, httpCode: number){
        return new ServiceError(message,{mlCode,httpCode});
    }
}