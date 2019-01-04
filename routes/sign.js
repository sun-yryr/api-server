/* パッケージ読み込み */
var express = require('express');
var router = express.Router();
const shiwori = require('./shiwori_auth');
var connection = require('./mysql_connection');

/* グローバル変数 */

/* 関数 */
async function query(query) {
  return new Promise(function(resolve, reject) {
    connection.query(query, function(err, rows) {
      if(!err) {
        reject(null);
      } else {
        resolve(rows);
      }
    });
  });
}


/* urlの受け口を実装する */
/* root(/) is /shiwori/. */

/* shiwori純正の確認（今実装されているurlは全てこの関数？を通る） */
router.all('/*(\(signup\)|\(signin\)|\(book\)|\(bookmark\)|\(record\)|\(user\))', function(req, res, next) {
  console.log("aaaaa");
  if (shiwori.signature(req.body.signature)) {
    next();
  } else {
    res.status(401).end();
  }
});

/* 登録 */
router.post('/signup', function(req, res, next) {
  const body = req.body;
  console.log("signup...");
  var db_res = await query("select * from USERS where email = "+body.users);
  if (db_res.length != 0) {
    res.status(400);
    res.json({"message": "this e-mail is used."});
    next();
  }
  //uuid　または　ユニークなidの生成

  var query = "";
  connection.query();
  connection.query();
  connection.query();
  connection.query();
  //セクションidを生成、ログイン済のテーブルに追加

  connection.query();
  res.status(200);
  res.json({
    //return_DATA
  });
});

router.post('/signin', function(req, res, next) {
  const body = req.body;
  console.log("singin...");
  var db_res = await query("select * from USERS where email = "+body.users);
  if (db_res.length == 0 || db_res[0].password != body.password) {
    res.status(400);
    res.json({"message": "e-mail or password is invalid."});
    next();
  }
  var tmp_info = query(query);
  var tmp_record = query();
  var tmp_static = query();
  var tmp_bookmark = query();
  var user_info = await tmp_info;
  var user_record = await tmp_record;
  var user_static = await tmp_static;
  var user_bookmark = await tmp_bookmark;
  if (user_info == null | user_record == null | user_static == null | user_bookmark == null) {
    res.status(500);
    res.json({"message": "DataBase Error(can't read)"});
    next();
  }
  res.status(200);
  res.json({
    //return_DATA
  });
});

module.exports = router;
