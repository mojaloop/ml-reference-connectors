"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlugins = void 0;
const loggingPlugin_1 = require("./loggingPlugin");
const createPlugins = (options) => [
    {
        plugin: loggingPlugin_1.loggingPlugin,
        options,
    },
    // pass any other plugins here, if needed
];
exports.createPlugins = createPlugins;
//# sourceMappingURL=index.js.map