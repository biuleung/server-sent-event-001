import { Request, Response, NextFunction } from 'express';
import logger from './util/logger';
import app from './app';
// import { StaiError } from '@systalk/error';
import settings from './util/config/settings';
import _ from 'lodash';

if (settings.node_env === 'development') {
  // 開發模式的錯誤處理
  app.use((error: any, req: Request, res: Response, _next: NextFunction) => {
    let errorJson = null;
    let httpStatus = 500;
    // if (error instanceof StaiError) {
    //   errorJson = error.toStaiErrorJSON(true);
    //   httpStatus = error.errorCode.httpStatus;
    //   logger.info(error);
    // } 
    if (error instanceof Error) {
      errorJson = { status: httpStatus, stack: error.stack, message: error.message };
      logger.info(error);
    } else {
      errorJson = error;
      // 無預期的錯誤
      logger.warn(error);
    }
    if (isJSON(req)) {
      return res.status(httpStatus).json({ error: errorJson });
    }
    return res.status(httpStatus).render('error', { error: errorJson });
  });
}
// 生產模式的錯誤處理
app.use((error: any, req: Request, res: Response, _next: NextFunction) => {
  let errorJson = null;
  let httpStatus = 500;
  // if (error instanceof StaiError) {
  //   errorJson = error.toStaiErrorJSON();
  //   httpStatus = error.errorCode.httpStatus;
  //   logger.info(error);
  // } 
  if (error instanceof Error) {
    errorJson = { status: httpStatus, message: error.message };
    logger.info(error);
  } else {
    errorJson = error;
    // 無預期的錯誤
    logger.warn(JSON.stringify(error));
  }
  if (req.is('json') !== false) {
    return res.status(httpStatus).json({ error: errorJson });
  }
  return res.status(httpStatus).render('error', { error: errorJson });
});

function isJSON(req: Request) {
  if (req.is('json')) {
    return true;
  }
  const accept = req.header('accept');
  if (_.isString(accept) && accept.indexOf('json') >= 0) {
    return true;
  }
  return false;
}

/**
 * Start Express server.
 */
const server = app.listen(app.get('port'), () => {
  console.log(
    '  App is running at http://localhost:%d in %s mode',
    app.get('port'),
    app.get('env'),
  );
  console.log('  Press CTRL-C to stop\n');
});

export default server;
