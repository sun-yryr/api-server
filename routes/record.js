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
  
    var user_id = req.body['user_id'];
    var book_id = req.body['book_id'];
    var user_name = req.body['user_name'];;
    var star = req.body['star'];;
    var impression = req.body['impression'];
    var readtime = req.body['readtime'];;
    var readspeed = req.body['readspeed'];
    var created_date = req.body['created_date'];

    /*最終段を持ってくる */

    /*データの登録 */
    let sql = 'INSERT INTO records (user_id,book_id,user_name,star,impression,readtime,readspeed,creted_date) VALUES (user_id,book_id,user_name,star,impression,readtime,readspeed,creted_date)';
});



module.exports = router;
