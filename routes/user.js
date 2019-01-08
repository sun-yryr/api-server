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
  const userid = req.query.userid;
  const db_res = shiwori.dbAccess('select * from USERS where id="' + userid + '"')
    .catch((err) => {
      res.status(500).json({"message": err});
      return;
  });
  var tmp = {
    "username": db_res[0].name,
    "introduction": db_res[0].introduction,
    "allreadbooks": db_res[0].allreadbooks,
    "allreadtime": db_res[0].allreadtime,
    "create_date": db_res[0].create_date
  }
  res.status(200).json(tmp);
});

module.exports = router;
