/* パッケージ読み込み */
var express = require('express');
var router = express.Router();
var util = require('util');
const shiwori = require('./shiwori');

/* グローバル変数 */

/* 関数 */




/* urlの受け口を実装する */
/* root(/) is /shiwori/bookmark/. */
/* ブックマークの登録 */
router.post('/register', shiwori.check_signature, async function(req, res, next) {
  console.log("bookmark.register...");
  var date = new Date();
  var time_msec = date.getTime();
  var unixtime = Math.floor(time_msec / 1000);
  const body = req.body;
  const userid = body.userid;
  var db_res = await shiwori.dbAccess('select name from USERS where id="' + userid + '"')
    .catch((err) => {
      res.status(500).end();
      return;    
  });
  if(db_res[0].name == undefined) {
    res.status(400);
    res.json({"message": "no userid."});
    return;
  }
  var query = 'insert into BOOKMARKS (userid, username, bookid, page, memo, update_time) ';
  query += util.format('VALUE ("%s", "%s", "%s", %d, "%s", "%s")', userid, db_res[0].name, body.bookid, body.page, body.memo, unixtime);
  shiwori.dbAccess(query).then((body) => {
    console.log(body);
    res.status(200);
    res.json({"id": body.insertId});
  }).catch((err) => {
    res.status(400);
    res.json({"message": err});
    return;
  });
});

/* ブックマークの削除 */
router.delete('/delete', shiwori.check_signature, async function(req, res, next) {
  console.log("bookmark.delete...");
  shiwori.dbAccess('select * from BOOKMARKS where id="' + req.body.id + '"')
    .then((body) => {
      if(body[0].userid == req.body.userid) {
        shiwori.dbAccess('delete from BOOKMARKS where id="'+ req.body.id +'"')
          .catch((err) => {
            res.status(400);
            res.json({"message": err});
            return;
          })
      }
  }).catch((err) => {
      res.status(400);
      res.json({"message": err});
      return;
  });
  res.status(200).end();
})

/* ブックマークのList取得 */
router.get('/list', shiwori.check_signature, async function(req, res, next) {
  console.log("bookmark.list...");
  const db_data = await shiwori.dbAccess('select * from BOOKMARKS where userid="' + req.query.userid + '"')
    .catch((err) => {
      res.status(500).json({"message": err});
  });
  Promise.all(db_data.map(async function(item) {
    var tmp = {
      "userid": item.userid,
      "username": item.username,
      "page": item.page,
      "memo": item.memo,
      "update_date": item.update_time,
      "book": await shiwori.getBookData(item.bookid)
    };
    return tmp;
  })).then((data) => {
    res.status(200).json(data);
  });
});

module.exports = router;
