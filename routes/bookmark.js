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
  var nowtime = shiwori.getNowTime();
  const body = req.body;
  const user_id = body.user_id;
  var db_res = await shiwori.dbAccess('SELECT user_name FROM users WHERE user_id="' + user_id + '"')
    .catch((err) => {
      res.status(500).json({"message": err});
      return;    
  });
  if(db_res.length == 0) {
    res.status(400);
    res.json({"message": "no user_id."});
    return;
  }
  var query = 'INSERT INTO bookmarks (user_id, book_id, user_name, page_num, memo, created_date) ';
  query += util.format('VALUE ("%s", "%s", "%s", %d, "%s", "%s")', user_id, body.book_id, db_res[0].user_name, body.page_num, body.memo, nowtime);
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
  shiwori.dbAccess('SELECT * FROM bookmarks WHERE bm_id="' + req.body.bm_id + '"')
    .then((body) => {
      if(body[0].user_id == req.body.user_id) {
        shiwori.dbAccess('DELETE FROM bookmarks WHERE bm_id="'+ req.body.bm_id +'"')
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
  const db_data = await shiwori.dbAccess('SELECT * FROM bookmarks WHERE user_id="' + req.query.user_id + '"')
    .catch((err) => {
      res.status(500).json({"message": err});
  });
  Promise.all(db_data.map(async function(item) {
    var tmp = {
      "user_id": item.user_id,
      "user_name": item.user_name,
      "page_num": item.page_num,
      "memo": item.memo,
      "update_date": item.created_date,
      "book": await shiwori.getBookData(item.book_id)
    };
    return tmp;
  })).then((data) => {
    res.status(200).json(data);
  }).catch((data) => {
    res.status(100).json(data);
  });
});

module.exports = router;
