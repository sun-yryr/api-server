/* パッケージ読み込み */
var express = require('express');
const request = require('request');
var router = express.Router();
var shiwori = require('./shiwori');


/* グローバル変数 */

/* 関数 */


/* urlの受け口を実装する */
/* root(/) is /shiwori/book/. */

/* 本の情報を取得する */
router.get('/', async function(req, res, next) {
  const bookid = req.query.book_id;
  let book = {
    "book": await shiwori.getBookData(bookid).catch(() => null),
    "records": "",
    "star_average": ""
  }
  if(!book.book) {
    res.status(500).json({"error": "情報を取得できませんでした"});
    return;
  }
  const db_res = await shiwori.dbAccess('SELECT * FROM records WHERE book_id="' + bookid + '"').catch(() => null);
  let star_ave = 0;
  if(db_res && db_res.length != 0) {
    var recordlist = db_res.map((item) => {
      star_ave += item.star;
      var tmp = {
        "record_id": item.record_id,
        "user_id": item.user_id,
        "star": item.star,
        "impression": item.impression,
        "update_date": item.update_date
      }
      return tmp;
    });
    book.records = recordlist;
  }
  book.star_average = star_ave/db_res.length;
  res.status(200).json(book);
});

module.exports = router;