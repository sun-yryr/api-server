/* パッケージ読み込み */
var express = require('express');
var router = express.Router();
const shiwori = require('./shiwori_auth');

/* グローバル変数 */

/* 関数 */


/* urlの受け口を実装する */
/* root(/) is /shiwori/. */

/* shiwori純正の確認（今実装されているurlは全てこの関数？を通る） */
router.all('/*(\(signup\)|\(signin\)|\(book\)|\(bookmark\)|\(record\)|\(user\))', function(req, res, next) {
  console.log("aaaaa");
  if (shiwori.signature(req.body.signature)) {
    next();
  } else {
    res.send("error");
  }
});

/* 登録 */
router.post('/signup', function(req, res, next) {
  const body = req.body;
  console.log("nextのチェック");
})

module.exports = router;
