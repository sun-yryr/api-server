/* パッケージ読み込み */
var express = require('express');
var router = express.Router();
var shiwori = require('./shiwori');

/* グローバル変数 */

/* 関数 */


/* urlの受け口を実装する */
/* root(/) is /shiwori/user/. */
/* ユーザー情報の取得（署名なし） */
router.get('/', async function(req, res, next) {
  const userid = req.query.user_id;
  const db_res = await shiwori.dbAccess('SELECT * FROM users WHERE user_id="' + userid + '"')
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

router.post('/change', shiwori.check_signature, async function(req, res, next) {
  var query = 'UPDATE users ';
  query += util.format('SET user_name = "%s", introduction = "%s", update_date = "%s" WHERE user_id = "%s"', body.user_name, body.introduction, nowtime, body.user_id);
  const db_res = await shiwori.dbAccess(query).catch((err) => {
    res.status(500).json({"message": err});
    return;
  });
  res.status(200).end();
});

module.exports = router;
