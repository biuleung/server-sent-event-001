
import * as winston from 'winston';
import settings from './config/settings';
import * as Transport from 'winston-transport';
import moment from 'moment';

class MyConsoleTransport extends Transport.default {
  // console顯示的代碼
  static ConsoleColorStyle = {
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
  constructor(opts: any) {
    super(opts);
    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail,
    //   logentries, etc.).
    //
  }

  log(info: any, callback: () => void) {
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
      if (typeof(info) === 'string') {
        message = info;
      } else if (info instanceof Error) {
        message = info.stack ? info.stack : info.message;
      } else if (info.message || info.stack) {
        message = info.stack ? info.stack : info.message;
      } else {
        message = JSON.stringify(info);
      }

      message = `${moment().format('YYYY-MM-DDTHH:mm:ssZ')} ${message}`;

      console.info(this.getColorFormat(colorCode) , info.level , message);
    });
    callback();
  }

  private getColorFormat(colorCode: string):string {
    return `${colorCode}%s${MyConsoleTransport.ConsoleColorStyle.Reset} %s`;
  }
}

class LoggerManager {
  static logger: winston.Logger; // .LoggerInstance;

  static morganStream = {
    write: function (message: string) {
      LoggerManager.logger.info(message);
    },
  };

  public static getLogger() {
    if (LoggerManager.logger == null) {
      LoggerManager.logger = winston.createLogger({
        level: settings.logLevel,

        transports: [
          new MyConsoleTransport({
            level : settings.logLevel,
          }),
        ],
      });
    }
    return LoggerManager.logger;
  }
}
const logger = LoggerManager.getLogger();
export default logger;
