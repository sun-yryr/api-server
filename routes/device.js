/* パッケージ読み込み */
var express = require('express');
var shiwori = require('./shiwori');
var util = require('util');
var router = express.Router();

/* urlの受け口を実装する */
/* root(/) is /shiwori/device */
router.post('/insert', shiwori.check_signature, async function(req, res, next) {
  console.log("device.post...");
    var user_id = req.body['user_id'];
    var db_res = await shiwori.dbAccess("select current_book_id from users where user_id='"+user_id+"'");
    if(!db_res[0]){
      res.status(500).end();
      return;
    }
    var book_id = db_res[0].current_book_id;
    var timestamp = shiwori.getNowTime();
    var page_num = req.body['page_num'];
    var readtime = req.body['readtime'];
    var readspeed = (readtime / 60000)/ page_num;

    /*最終段を持ってくる */

    /*データの登録 */
    var sql = util.format('INSERT INTO device (user_id,book_id,timestamp,page_num,readtime,readspeed) VALUES ("%s","%s","%s",%d,"%d","%d")',user_id,book_id,timestamp,page_num,readtime,readspeed);
    db_res =await shiwori.dbAccess(sql).catch((err)=>{
      console.log(err);
      res.status(500).json({"message":err});
    });
    res.status(200).end();
});

/* データのList取得 */
router.get('/get', async function(req, res, next) {
  console.log("device.list...");
  const db_res = await shiwori.dbAccess('SELECT * FROM device WHERE user_id="' + req.query.user_id + '"')
    .catch((err) => {
      res.status(500).json({"message": err});
  });
  res.status(200).json(db_res);

});

module.exports = router;