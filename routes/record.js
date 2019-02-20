/* パッケージ読み込み */
var express = require('express');
var shiwori = require('./shiwori');
var util = require('util');
var router = express.Router();

/* urlの受け口を実装する */
/* root(/) is /shiwori/record/ */
router.post('/insert', async function(req, res, next) {
  
    var user_id = req.body['user_id'];
    var book_id = req.body['book_id'];
    var db_res = await shiwori.dbAccess("select user_name from users where user_id='"+user_id+"'");
    var user_name = db_res[0].user_name;
    if(user_name!=req.body['user_name']) {
      res.status(400).json({"message": "invalid this user_name."});
    }
    var star = req.body['star'];
    var impression = req.body['impression'];
    var readtime = req.body['readtime'];
    var readspeed = req.body['readspeed'];
    var created_date = shiwori.getNowTime();

    /*最終段を持ってくる */

    /*データの登録 */
    var sql = util.format('INSERT INTO records (user_id,book_id,user_name,star,impression,readtime,readspeed,created_date) VALUES ("%s","%s","%s",%d,"%s","%s",%d,"%s")',user_id,book_id,user_name,star,impression,readtime,readspeed,created_date);
    db_res =await shiwori.dbAccess(sql).catch((err)=>{
      console.log(err);
      res.status(500).json({"message":err});
    });
    res.status(200).json({"record_id": db_res.insertId});
});

router.post('/update', async function(req, res, next) {
  
  var user_id = req.body['user_id'];
  var book_id = req.body['book_id'];
  var db_res = await shiwori.dbAccess("select user_name from users where user_id='"+user_id+"'");
  var user_name = db_res[0].user_name;
  var star = req.body['star'];
  var impression = req.body['impression'];
  var readtime = req.body['readtime'];
  var readspeed = req.body['readspeed'];
  var created_date = shiwori.getNowTime();

  /*最終段を持ってくる */

  /*データの登録 */
  // UPDATE テーブル名 SET カラム名=`値`[, カラム名=`値`, ... ] WHERE 条件式;

  var sql = util.format('UPDATE records SET user_id = "%s" ,book_id="%s",user_name="%s",star=%d,impression="%s",readtime="%s",readspeed=%d,created_date="%s" WHERE key="%s"',user_id,book_id,user_name,star,impression,readtime,readspeed,created_date,key);
  db_res =await shiwori.dbAccess(sql).catch((err)=>{
    console.log(err);
    res.status(500).json({"message":err});
  });
  res.status(200).end();
});


/* データのList取得 */
router.get('/list', shiwori.check_signature, async function(req, res, next) {
  console.log("record.list...");
  const db_data = await shiwori.dbAccess('SELECT * FROM bookmarks WHERE user_id="' + req.query.user_id + '" AND book_id ="' + req.query.book_id + '"')
    .catch((err) => {
      res.status(500).json({"message": err});
  });
  Promise.all(db_data.map(async function(item) {
    var tmp = {
      "user_id": item.user_id,
      "book_id": item.book_id,
      "user＿name": item.user_name,
      "star": item.star,
      "impression": item.impression,
      "readtime": item.readtime,
      "readspeed": item.readspeed,
      "created_date": item.created_date
    };
    return tmp;
  })).then((data) => {
    res.status(200).json(data);
  });
});

module.exports = router;
