import { loggerFactory } from '@mojaloop/central-services-logger/src/contextLogger';

const logger = loggerFactory('CC');
logger.setLevel("debug");

export {logger};