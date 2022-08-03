import * as express from 'express';

const router = express.Router();
// 服務初始化的部分
router.get('/', (_req , res) => {
  return res.render('home');
});
export = router;
