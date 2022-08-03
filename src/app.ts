import path from 'path';
// 系統目錄設定
global.base_dir = __dirname;
global.root_dir = path.join(__dirname, './..');

import express from 'express';
import settings from './util/config/settings';

import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import frontendRouter from './routes/frontend';
import apiRouter from './routes/api';

// Create Express server
const app = express();

// Express configuration
app.set('port', settings.port);
app.set('views', path.join(global.root_dir, 'views'));
app.set('view engine', 'pug');
// 允許所有
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// 安全性設定
// 啟用X-Frame-Options標頭，SAMEORIGIN設定為同源檢查(必須為 相同協定、來源網址、port)
app.use(helmet({
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
app.use(
  express.static(path.join(global.root_dir, 'public'), { maxAge: 31557600000 }),
);

// 前端網頁部分

app.use('/' , frontendRouter);
app.use('/api', apiRouter);


export default app;
