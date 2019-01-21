/* パッケージ読み込み */
var express = require('express');
var shiwori = require('./shiwori');
var util = require('util');
var router = express.Router();

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
/* root(/) is /shiwori/record/ */
router.post('/insert', async function(req, res, next) {
  
    var user_id = req.body['user_id'];
    var book_id = req.body['book_id'];
    var user_name = req.body['user_name'];
    var star = req.body['star'];
    var impression = req.body['impression'];
    var readtime = req.body['readtime'];
    var readspeed = req.body['readspeed'];
    var created_date = shiwori.getNowTime();

    /*最終段を持ってくる */

    /*データの登録 */
    var sql = util.format('INSERT INTO records (user_id,book_id,user_name,star,impression,readtime,readspeed,created_date) VALUES ("%s","%s","%s",%d,"%s","%s",%d,"%s")',user_id,book_id,user_name,star,impression,readtime,readspeed,created_date);
    var db_res =await shiwori.dbAccess(sql).catch((err)=>{
      console.log(err);
      res.status(500).json({"message":err});
    });
    res.status(200).end();
});

router.post('/update', async function(req, res, next) {
  
  var user_id = req.body['user_id'];
  var book_id = req.body['book_id'];
  var user_name = req.body['user_name'];
  var star = req.body['star'];
  var impression = req.body['impression'];
  var readtime = req.body['readtime'];
  var readspeed = req.body['readspeed'];
  var key = req.body['key'];
  var created_date = shiwori.getNowTime();

  /*最終段を持ってくる */

  /*データの登録 */
  // UPDATE テーブル名 SET カラム名=`値`[, カラム名=`値`, ... ] WHERE 条件式;

  var sql = util.format('UPDATE records SET user_id = "%s" [,book_id="%s",user_name="%s",star=%d,impression="%s",readtime="%s",readspeed=%d,created_date="%s"] WHERE key="%s"',user_id,book_id,user_name,star,impression,readtime,readspeed,created_date,key);
  var db_res =await shiwori.dbAccess(sql).catch((err)=>{
    console.log(err);
    res.status(500).json({"message":err});
  });
  res.status(200).end();
});

module.exports = router;
