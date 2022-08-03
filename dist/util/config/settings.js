"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
class Settings {
    constructor() {
        this.node_env = !lodash_1.default.isNil(process.env.NODE_ENV) ? process.env.NODE_ENV : 'development';
        this.port = !lodash_1.default.isNil(process.env.PORT) ? process.env.PORT : '3000';
        this.logLevel = !lodash_1.default.isNil(process.env.LOG_LEVEL) ? process.env.LOG_LEVEL : 'warn';
    }
    /**
     * 將傳入值轉型為整數，如果無法轉型，則回覆一個預設值
     *
     * @static
     * @param {*} data
     * @param {number} defaultValue
     * @returns {number}
     * @memberof Settings
     */
    static parseIntOrDefault(data, defaultValue) {
        const parsed = Number.parseInt(data, 10);
        if (!lodash_1.default.isNumber(parsed)) {
            return defaultValue;
        }
        return parsed;
    }
    static getSettings() {
        if (!this._settings) {
            this._settings = new Settings();
        }
        return this._settings;
    }
}
const settings = Settings.getSettings();
exports.default = settings;
//# sourceMappingURL=settings.js.map