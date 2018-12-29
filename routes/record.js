/* パッケージ読み込み */
var express = require('express');
var router = express.Router();

/* グローバル変数 */

/* 関数 */


/* urlの受け口を実装する */
/* root(/) is /shiwori/. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
