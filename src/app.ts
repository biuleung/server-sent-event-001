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

import mongoose from 'mongoose';


const url = `mongodb+srv://biuleong-test-01:bWe%40P5kH%40VXi4M2@cluster0.jikxd.mongodb.net/test001?retryWrites=true&w=majority`;

mongoose.connect(url)
  .then(() => {
    console.log('Connected to database ');
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  })

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
app.use(helmet({}));

// router========================================
app.use(
  express.static(path.join(global.root_dir, 'public'), { maxAge: 31557600000 }),
);

// 前端網頁部分

app.use('/', frontendRouter);
app.use('/api', apiRouter);


export default app;
