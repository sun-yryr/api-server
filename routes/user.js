/* パッケージ読み込み */
var express = require('express');
var router = express.Router();
var shiwori = require('./shiwori');
var util = require('util');
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

router.post('/current_book', shiwori.check_signature,async function(req, res, next) {
  
  var user_id = req.body['user_id'];
  var sql = util.format('SELECT * FROM users WHERE user_id="%s"',user_id);
  var db_res  = await shiwori.dbAccess(sql)
  if(db_res.length != 1){
    res.status(500).json({
      "message": "this userid is not found"
    })
    return;
  }
  var current_book_id = req.body['current_book_id'];

  /*最終段を持ってくる */

  /*データの登録 */
  // UPDATE テーブル名 SET カラム名=`値`[, カラム名=`値`, ... ] WHERE 条件式;

  var sql = util.format('UPDATE users SET current_book_id="%s" WHERE user_id="%s"',current_book_id,user_id);
  db_res =await shiwori.dbAccess(sql).catch((err)=>{
    console.log(err);
    res.status(500).json({"message":err});
  });
  res.status(200).end();
});

module.exports = router;
