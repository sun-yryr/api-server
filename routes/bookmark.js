/* パッケージ読み込み */
var express = require('express');
var router = express.Router();
var util = require('util');
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


/* shiwori純正（signature）の確認 */
const check_signature = (req, res, next) => {
  if (shiwori.signature(req)) {
    next();
  } else {
    res.status(401).end();
    return;
  }
};

/* urlの受け口を実装する */
/* root(/) is /shiwori/bookmark/. */
/* ブックマークの登録 */
router.post('/register', check_signature, function(req, res, next) {
  console.log("bookmark.register...");
  var date = new Date();
  var time_msec = date.getTime();
  var unixtime = Math.floor(time_msec / 1000);
  const body = req.body;
  const userid = body.userid;
  var query = 'insert into BOOKMARKS (userid, username, isbn, page, memo, update_time) ';
  query += util.format('VALUE ("%s", %s, %d, %d, %s, %s)', userid, body.username, body.isbn, body.page, body.memo, unixtime);
  connection2(query).then(function() {
    res.status(200).end;
  }).catch((err) => {
    res.status(400);
    res.json({"message": err});
  })
});

module.exports = router;
