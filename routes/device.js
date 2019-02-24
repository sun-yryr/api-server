/* パッケージ読み込み */
var express = require('express');
var shiwori = require('./shiwori');
var util = require('util');
var Jimp = require('jimp');
var fs = require('fs');
var router = express.Router();

/* urlの受け口を実装する */
/* root(/) is /shiwori/device */
router.post('/insert', shiwori.check_signature, async function(req, res, next) {
  console.log("device.post...");
  var user_id = req.body['user_id'];
  var db_res = await shiwori.dbAccess("select current_book_id from users where user_id='"+user_id+"'");
  if(db_res.length != 1){
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

/* current aaa */
router.get('/current', async function(req, res, next) {
  const user_id = req.query.user_id;
  var db_res = await shiwori.dbAccess('SELECT current_book_id FROM users WHERE user_id="'+user_id+'"');
  if(db_res[0].current_book_id == null) {
    res.status(300).end();
    return;
  }
  var book = await shiwori.getBookData(db_res[0].current_book_id);
  let url = "";
  if(book.imgUrl.large != null) url = book.imgUrl.large;
  else if(book.imgUrl.medium != null) url = book.imgUrl.medium;
  else if(book.imgUrl.small != null) url = book.imgUrl.small;
  else if(book.imgUrl.thumbnail != null) url = book.imgUrl.thumbnail;
  else if(book.imgUrl.smallThumbnail != null) url = book.imgUrl.smallThumbnail;
  else {
    res.status(300).end();
    return;
  }
  Jimp.read(url, function(err, image) {
    if(err) {
      res.status(400).json(err);
      return;
    }
    image.scaleToFit(200, 200);
    //image.greyscale();
    //image.color([{apply: 'greyscale', params: [0] }]);
    image.flip(false, true);
    const path = "public/images/"+user_id+".bmp";
    image.write(path);
    res.sendStatus(200);
  });
})

/* データのList取得 */
router.get('/get', async function(req, res, next) {
  console.log("device.list...");
  const db_res = await shiwori.dbAccess('SELECT * FROM device WHERE user_id="' + req.query.user_id + '"')
    .catch((err) => {
      res.status(500).json({"message": err});
  });
  res.status(200).json(db_res);
});

router.post('/update', shiwori.check_signature, async function(req, res, next) {
  const id = req.body.id;
  const page_num = req.body.page_num;
  const readtime = req.body.readtime;
  var db_res = await shiwori.dbAccess('SELECT user_id FROM device WHERE id='+id);
  if(db_res[0].user_id != req.body.user_id) {
    res.sendStatus(340);
    return;
  }
  var query = util.format("UPDATE device SET page_num=%d, readtime=%d WHERE id=%d", page_num, readtime, id);
  var db_res = await shiwori.dbAccess(query).catch((err) => {
    res.status(500).json({"message": err});
  });
  res.sendStatus(200);
})

module.exports = router;
