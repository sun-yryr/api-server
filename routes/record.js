/* パッケージ読み込み */
var express = require('express');
var router = express.Router();

const BookData = JSON.stringify(require("../bookdata.json"));

/* 関数 */
function doRequest(option) {
  return new Promise(function(resolve, reject) {
    request(option, function(error, res, body) {
      if(!error && res.statusCode == 200) {
        //let data = body.replace(/\\n?/g, "");
        resolve(JSON.parse(body));
      } else {
        reject(body);
      }
    });
  });
}

/* urlの受け口を実装する */
/* root(/) is /shiwori/. */
router.post('/', async function(req, res, next) {
  
    var user_id;
    var book_id;
    var user_name;
    var star;
    var impression;
    var readtime;
    var readspeed;
    var created_date;

    /*最終段を持ってくる */

    /*データの登録 */
    let sql = 'INSERT INTO records VALUES (user_id,book_id,user_name,star,impression,readtime,readspeed,creted_date)';
});



module.exports = router;
