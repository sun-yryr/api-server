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
  const bookid = req.query.bookid;
  const book = await shiwori.getBookData(bookid).catch(() => null);
  if(!book) {
    res.status(500).json({"error": "情報を取得できませんでした"});
    return;
  }
  res.status(200).json(book);
});

module.exports = router;