"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedSearchPluginUi = void 0;
const tslib_1 = require("tslib");
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const fs_1 = (0, tslib_1.__importDefault)(require("fs"));
let extensionPath;
try {
    const devModeExtensionPath = path_1.default.join(process.cwd(), 'libs/plugin-advanced-search/src/ui');
    fs_1.default.accessSync(devModeExtensionPath);
    extensionPath = devModeExtensionPath;
}
catch (e) {
    extensionPath = __dirname;
}
exports.advancedSearchPluginUi = {
    extensionPath,
    id: 'advanced-search-plugin',
    ngModules: [
        {
            type: 'shared',
            ngModuleFileName: 'advanced-search-ui-extension.module.ts',
            ngModuleName: 'AdvancedSearchUiExtensionModule',
        },
        {
            type: 'lazy',
            route: 'advanced-search',
            ngModuleFileName: 'advanced-search-ui-lazy.module.ts',
            ngModuleName: 'AdvancedSearchUiLazyModule',
        },
    ],
};
//# sourceMappingURL=index.js.map