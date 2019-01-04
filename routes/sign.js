/* パッケージ読み込み */
var express = require('express');
var router = express.Router();
var util = require('util');
var uuid = require('uuid');
const shiwori = require('./shiwori_auth');
var connection = require('./mysql_connection');

/* グローバル変数 */

/* 関数 */
function connection2(query) {
  return new Promise(function(resolve, reject) {
    connection.query(query, function(err, rows) {
      if(err) {
        console.log(err);
        reject("err");
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
router.post('/signup', async function(req, res, next) {
  var date = new Date();
  var time_msec = date.getTime();
  var unixtime = Math.floor(time_msec / 1000);
  const body = req.body;
  console.log("signup...");
  var db_res = await connection2("select * from USERS where email = '"+body.email+"'");
  if (db_res.length != 0) {
    res.status(400);
    res.json({"message": "this e-mail is used."});
    next();
  }
  //uuid　または　ユニークなidの生成
  var userid = uuid.v4();
  console.log(typeof(userid));
  var query = 'INSERT INTO USERS ';
  query += util.format('VALUES ("%s", "%s", "", 0, 0, 0, "%s", null, "%s", "%s", "%s")', userid, body.name, unixtime, unixtime, body.email, body.password);
  connection.query(query, function(err, rows) {
    if(err) {
      console.log(err);
    }
  });

  query = util.format('INSERT INTO STATISTICS VALUES ("%s")', userid);
  connection.query(query, function(err, rows) {
    if(err) {
      console.log(err);
    }
  });
  res.status(200);
  res.json({
    //return_DATA
    "userinfo": {
      "name": body.name,
      "userid": userid,
      "introduction": "",
      "create_date": unixtime,
      "update_date": unixtime,
      "email": body.email,
      "all_readtime": 0,
      "all_readbooks": 0,
      "speed": 0
    },
    "records": {},
    "bookmarks": {},
    "statistics": {}
  });
});

/*
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
*/

module.exports = router;
