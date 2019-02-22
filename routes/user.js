/* パッケージ読み込み */
var express = require('express');
var router = express.Router();
var shiwori = require('./shiwori');
var util = require('util');
/* グローバル変数 */
const default_user_data = {
  //return_DATA
  "userinfo": {
    "name": "",
    "user_id": "",
    "introduction": "",
    "created_date": 0,
    "update_date": 0,
    "email": "",
    "all_readtime": "",
    "all_readbooks_count": 0,
    "all_readspeed": 0
  },
  "records": [],
  "statistics":[]
};
/* 関数 */


/* urlの受け口を実装する */
/* root(/) is /shiwori/user/. */
/* ユーザー情報の取得（署名なし） */
router.get('/', async function(req, res, next) {
  const userid = req.query.user_id;
  const db_res = await shiwori.dbAccess('SELECT * FROM users WHERE user_id="' + userid + '"')
    .catch((err) => {
      res.status(500).json({"message": err});
      return;
  });
  var tmp = {
    "user_name": db_res[0].user_name,
    "introduction": db_res[0].introduction,
    "all_readbook_count": db_res[0].all_readbook_count,
    "all_readtime": db_res[0].all_readtime,
    "created_date": db_res[0].created_date
  }
  res.status(200).json(tmp);
});


router.post('/current_book', shiwori.check_signature,async function(req, res, next) {
  
  var user_id = req.body['user_id'];
  var sql = util.format('SELECT * FROM users WHERE user_id="%s"',user_id);
  var db_res  = await shiwori.dbAccess(sql)
  if(db_res.length != 1){
    res.status(500).json({
      "message": "this userid is not found"
    })
    return;
  }
  var current_book_id = req.body['current_book_id'];

  /*最終段を持ってくる */

  /*データの登録 */
  // UPDATE テーブル名 SET カラム名=`値`[, カラム名=`値`, ... ] WHERE 条件式;

  var sql = util.format('UPDATE users SET current_book_id="%s" WHERE user_id="%s"',current_book_id,user_id);
  db_res =await shiwori.dbAccess(sql).catch((err)=>{
    console.log(err);
    res.status(500).json({"message":err});

router.get('/home', shiwori.check_signature, async function(req, res, next) {
  const user_id = req.query.user_id;
  var query = "SELECT * FROM records WHERE user_id = '" + user_id + "'";
  var db_res = await shiwori.dbAccess("SELECT * FROM users WHERE user_id = '"+user_id+"'");
  if(db_res.length != 1) {
    res.status(400).json({"message":"no user."});
    return;
  }
  var user_info = db_res;
  var user_record = await shiwori.dbAccess(query).catch((err) => null);
  query = "SELECT * FROM statistics WHERE user_id = '" + user_id + "'";
  var user_static = await shiwori.dbAccess(query).catch((err) => null);
  //query = "SELECT * FROM bookmarks WHERE user_id = '" + user_id + "'";
  //var user_bookmark = await shiwori.dbAccess(query).catch((err) => null);
  if (user_record == null | user_static == null /*| user_bookmark == null*/) {
    res.status(500);
    res.json({"message": "DataBase Error(can't read)"});
    return;
  }
  var userdata = default_user_data;
  userdata.userinfo.name = user_info[0].user_name;
  userdata.userinfo.user_id = user_info[0].user_id;
  userdata.userinfo.introduction = user_info[0].inroduction;
  userdata.userinfo.all_readtime = user_info[0].all_readtime;
  userdata.userinfo.all_readbooks_count = user_info[0].all_readbooks_count;
  userdata.userinfo.create_date = user_info[0].created_date;
  userdata.userinfo.update_date = user_info[0].created_date;
  userdata.userinfo.all_readspeed = user_info[0].all_readspeed;
  userdata.userinfo.email = user_info[0].email;
  for(var i=0; i<user_record.length; i++) {
    let tmp = {
      "record_id": user_record[i].record_id,
      "user_name": user_record[i].user_name,
      "star": user_record[i].star,
      "impression": user_record[i].impression,
      "readtime": user_record[i].readtime,
      "readspeed": user_record[i].readspeed,
      "update_date": user_record[i].update_date,
      "book": null
    };
    tmp.book = await shiwori.getBookData(user_record[i].book_id).catch((err) => null);
    userdata.records.push(tmp);
  }
  /*
  for(var i=0; i<user_bookmark.length; i++) {
    let tmp = {
      "bm_id": user_bookmark[i].bm_id,
      "page_num": user_bookmark[i].page_num,
      "memo": user_bookmark[i].memo,
      "update_date": user_bookmark[i].update_date,
      "book": null
    };
    tmp.book = await shiwori.getBookData(user_bookmark[i].book_id).catch((err) => null);
    userdata.bookmarks.push(tmp);
  }*/
  // とりあえずこれはYYYY-MM-hogehogeを同じ階層に並べているだけ
  if(!user_static) {
    var keys = Object.keys(user_static[0]);
    for(var i=0; keys.length; i++) {
      userdata.statistics[keys[i]] = user_static[0][keys[i]];
    }
  }
  res.status(200).json(userdata);
})

router.post('/change', shiwori.check_signature, async function(req, res, next) {
  var query = 'UPDATE users ';
  query += util.format('SET user_name = "%s", introduction = "%s", update_date = "%s" WHERE user_id = "%s"', body.user_name, body.introduction, nowtime, body.user_id);
  const db_res = await shiwori.dbAccess(query).catch((err) => {
    res.status(500).json({"message": err});
    return;

  });
  res.status(200).end();
});

module.exports = router;
