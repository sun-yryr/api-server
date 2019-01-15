/* パッケージ読み込み */
var express = require('express');
var router = express.Router();
var shiwori = require('./shiwori');

/* グローバル変数 */

/* 関数 */


/* urlの受け口を実装する */
/* root(/) is /shiwori/user/. */
/* ユーザー情報の取得（署名なし） */
router.get('/', function(req, res, next) {
  const userid = req.query.user_id;
  const db_res = shiwori.dbAccess('SELECT * FROM users WHERE user_id="' + userid + '"')
    .catch((err) => {
      res.status(500).json({"message": err});
      return;
  });
  var tmp = {
    "user_name": db_res[0].user_name,
    "introduction": db_res[0].introduction,
    "all_readbook_count": db_res[0].all_readbook_count,
    "all_readtime": db_res[0].all_readtime,
    "created_date": db_res[0].created_date
  }
  res.status(200).json(tmp);
});

module.exports = router;
