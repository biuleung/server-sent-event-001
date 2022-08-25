import _ from 'lodash';
import dotenv from 'dotenv';
class Settings {
  /**
   * 將傳入值轉型為整數，如果無法轉型，則回覆一個預設值
   *
   * @static
   * @param {*} data
   * @param {number} defaultValue
   * @returns {number}
   * @memberof Settings
   */
  static parseIntOrDefault(data:any , defaultValue :number):number {
    const parsed = Number.parseInt(data , 10);
    if (!_.isNumber(parsed)) {
      return defaultValue;
    }
    return parsed;
  }
  static _settings : Settings;
  static getSettings() {
    if (!this._settings) {
      this._settings = new Settings();
    }
    return this._settings;
  }
  /**
   * node運作模式，表示為 production 或 development
   *
   * @type {string}
   * @memberof Settings
   */
  node_env: string;
  /**
   * 運作監聽的port
   *
   * @type {string}
   * @memberof Settings
   */
  port: string;
  /**
   * 設定 log 呈現的等級，可用的設定由高到低
   *   error、warn、info、debug
   *
   * @type {string}
   * @memberof Settings
   */
  logLevel:string;

  constructor() {
    dotenv.config();
    this.node_env = !_.isNil(process.env.NODE_ENV) ? process.env.NODE_ENV : 'development';
    this.port = !_.isNil(process.env.PORT) ? process.env.PORT : '3000';
    this.logLevel = !_.isNil(process.env.LOG_LEVEL) ? process.env.LOG_LEVEL : 'warn';
  }
}

const settings = Settings.getSettings();

export default settings;
