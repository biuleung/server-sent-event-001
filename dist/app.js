"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
// 系統目錄設定
global.base_dir = __dirname;
global.root_dir = path_1.default.join(__dirname, './..');
const express_1 = __importDefault(require("express"));
const settings_1 = __importDefault(require("./util/config/settings"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const frontend_1 = __importDefault(require("./routes/frontend"));
const api_1 = __importDefault(require("./routes/api"));
// Create Express server
const app = express_1.default();
// Express configuration
app.set('port', settings_1.default.port);
app.set('views', path_1.default.join(global.root_dir, 'views'));
app.set('view engine', 'pug');
// 允許所有
app.use(cors_1.default());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// 安全性設定
// 啟用X-Frame-Options標頭，SAMEORIGIN設定為同源檢查(必須為 相同協定、來源網址、port)
app.use(helmet_1.default({
// contentSecurityPolicy:{
//     directives: {
//         fontSrc : ["'self'" , "data:"],
//         // scriptSrc : ["'self'" , "'unsafe-inline'" , "" ],
//         scriptSrc: [
//             "'self'",
//             // 針對不支援nonce的瀏覽器提供服務
//             "'unsafe-inline'",
//             "'nonce-1d8f595c-35e6-4816-9136-d2570840785b'",
//             function (req, res) {
//                 //'nonce-614d9122-d5b0-4760-aecf-3a5d17cf0ac9'
//                 return "'nonce-" + res.viewModel.CSP_nonce + "'";
//             }
//         ],
//         styleSrc : [
//             "'self'",
//             // 針對不支援nonce的瀏覽器提供服務
//             "'unsafe-inline'",
//             "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
//             "'sha256-xylbkVtqJQuRDTD/O50Zkbb0PJR006+vxsulnu5EOD4='",
//             "'sha256-G5+N2IFfqXlpJdNHrzbEE2GoopviouWyNRPlvMT+DgU='"
//         ],
//         defaultSrc: ["'self'"]
//     }
// },
// frameguard: {
//   action: "SAMEORIGIN"
// }
}));
// router========================================
app.use(express_1.default.static(path_1.default.join(global.root_dir, 'public'), { maxAge: 31557600000 }));
// 前端網頁部分
app.use('/', frontend_1.default);
app.use('/api', api_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map