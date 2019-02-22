/* パッケージ読み込み */
var express = require('express');
var shiwori = require('./shiwori');
var util = require('util');
var router = express.Router();

/* urlの受け口を実装する */
/* root(/) is /shiwori/device */
router.post('/insert', async function(req, res, next) {
  console.log("device.post...");
    var user_id = req.body['user_id'];
    var db_res = await shiwori.dbAccess("select current_bookid from users where user_id='"+user_id+"'");
    var book_id = db_res[0].current_bookid;
    if(book_id!=req.body['current_bookid']) {
      res.status(400).json({"message": "invalid this current_bookid."});
    }
    var timestamp = req.body['timestamp'];
    var page_num = req.body['page_num'];
    var readtime = req.body['readtime'];
    var readspeed = req.body['readspeed'];

    /*最終段を持ってくる */

    /*データの登録 */
    var sql = util.format('INSERT INTO records (user_id,book_id,timestamp,page_num,readtime,readspeed) VALUES ("%s","%s","%s",%d,"%d","%d")',user_id,book_id,timestamp,readtime,readspeed);
    db_res =await shiwori.dbAccess(sql).catch((err)=>{
      console.log(err);
      res.status(500).json({"message":err});
    });
    res.status(200).json({"record_id": db_res.insertId});
});

/* データのList取得 */
router.get('/get', shiwori.check_signature, async function(req, res, next) {
  console.log("device.list...");
  const db_data = await shiwori.dbAccess('SELECT * FROM device WHERE user_id="' + req.query.user_id + '"')
    .catch((err) => {
      res.status(500).json({"message": err});
  });
  Promise.all(db_data.map(async function(item) {
    var tmp = {
      "user_id": item.user_id,
      "book_id": item.book_id,
      "timestamp": item.user_name,
      "page_num": item.star,
      "readtime": item.readtime,
      "readspeed": item.readspeed,
    };
    return tmp;
  })).then((data) => {
    res.status(200).json(data);
  });
});

module.exports = router;