"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston = __importStar(require("winston"));
const settings_1 = __importDefault(require("./config/settings"));
const Transport = __importStar(require("winston-transport"));
const moment_1 = __importDefault(require("moment"));
class MyConsoleTransport extends Transport.default {
    constructor(opts) {
        super(opts);
    }
    log(info, callback) {
        setImmediate(() => {
            let colorCode = MyConsoleTransport.ConsoleColorStyle.BgWhite;
            if (info.level) {
                switch (info.level) {
                    case 'emerg':
                        colorCode = MyConsoleTransport.ConsoleColorStyle.BgRed;
                        break;
                    case 'alert':
                        colorCode = MyConsoleTransport.ConsoleColorStyle.BgRed;
                        break;
                    case 'crit':
                        colorCode = MyConsoleTransport.ConsoleColorStyle.BgRed;
                        break;
                    case 'error':
                        colorCode = MyConsoleTransport.ConsoleColorStyle.BgRed;
                        break;
                    case 'warn':
                        colorCode = MyConsoleTransport.ConsoleColorStyle.FgYellow;
                        break;
                    case 'notice':
                        colorCode = MyConsoleTransport.ConsoleColorStyle.FgBlue;
                        break;
                    case 'info':
                        colorCode = MyConsoleTransport.ConsoleColorStyle.FgGreen;
                        break;
                    case 'debug':
                        colorCode = MyConsoleTransport.ConsoleColorStyle.FgGreen;
                        break;
                }
            }
            let message = '';
            if (typeof (info) === 'string') {
                message = info;
            }
            else if (info instanceof Error) {
                message = info.stack ? info.stack : info.message;
            }
            else if (info.message || info.stack) {
                message = info.stack ? info.stack : info.message;
            }
            else {
                message = JSON.stringify(info);
            }
            message = `${(0, moment_1.default)().format('YYYY-MM-DDTHH:mm:ssZ')} ${message}`;
            console.info(this.getColorFormat(colorCode), info.level, message);
        });
        callback();
    }
    getColorFormat(colorCode) {
        return `${colorCode}%s${MyConsoleTransport.ConsoleColorStyle.Reset} %s`;
    }
}
MyConsoleTransport.ConsoleColorStyle = {
    Reset: '\x1b[0m',
    FgBlack: '\x1b[30m',
    FgRed: '\x1b[31m',
    FgGreen: '\x1b[32m',
    FgYellow: '\x1b[33m',
    FgBlue: '\x1b[34m',
    FgMagenta: '\x1b[35m',
    FgCyan: '\x1b[36m',
    FgWhite: '\x1b[37m',
    BgBlack: '\x1b[40m',
    BgRed: '\x1b[41m',
    BgGreen: '\x1b[42m',
    BgYellow: '\x1b[43m',
    BgBlue: '\x1b[44m',
    BgMagenta: '\x1b[45m',
    BgCyan: '\x1b[46m',
    BgWhite: '\x1b[47m',
};
class LoggerManager {
    static getLogger() {
        if (LoggerManager.logger == null) {
            LoggerManager.logger = winston.createLogger({
                level: settings_1.default.logLevel,
                transports: [
                    new MyConsoleTransport({
                        level: settings_1.default.logLevel,
                    }),
                ],
            });
        }
        return LoggerManager.logger;
    }
}
LoggerManager.morganStream = {
    write: function (message) {
        LoggerManager.logger.info(message);
    },
};
const logger = LoggerManager.getLogger();
exports.default = logger;
//# sourceMappingURL=logger.js.map