/* パッケージ読み込み */
var express = require('express');
var router = express.Router();
var util = require('util');
var uuid = require('uuid');
const request = require('request');
const shiwori = require('./shiwori');
var connection = require('./mysql_connection');

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
  "bookmarks": [],
  "statistics":[]
};

/* 関数 */


function UserCreate(body) {
  return new Promise(function(resolve, reject) {
    var nowtime = shiwori.getNowTime();
    //uuid　または　ユニークなidの生成
    var userid = uuid.v4();
    let userdata = default_user_data;
    userdata.userinfo.name = body.user_name;
    userdata.userinfo.user_id = userid;
    userdata.userinfo.created_date = nowtime;
    userdata.userinfo.update_date = nowtime;
    userdata.userinfo.email = body.email;
    //データベースアクセス
    var query = 'INSERT INTO users ';
    query += util.format('VALUES ("%s", "%s", "", null, 0, 0, "%s", null, "%s", "%s", "%s")', userid, body.user_name, nowtime, nowtime, body.email, body.password);
    connection.query(query, function(err, rows) {
      if(err) {
        console.log(err);
        reject(err);
      } else {
        query = util.format('INSERT INTO statistics VALUES ("%s")', userid);
        connection.query(query, function(err, rows) {
          if(err) {
            console.log(err);
            reject(err);
          } else {
            resolve(userdata);
          }
        });
      }
    });
  });
}


/* urlの受け口を実装する */
/* root(/) is /shiwori/. */

/* 登録 */
router.post('/signup', shiwori.check_signature, async function(req, res, next) {
  const body = req.body;
  console.log("signup....");
  var db_res = await shiwori.dbAccess("SELECT * FROM users WHERE 'e-mail' = '"+body.email+"'");
  if (db_res.length != 0) {
    res.status(400);
    res.json({"message": "this e-mail is used."});
    return;
  }
  UserCreate(body).then(function(value) {
    res.status(200);
    res.json(value);
  }).catch(function(err) {
    res.status(500);
    res.json({"message": "DataBase Error(can't write)"});
  });
});


router.post('/signin', shiwori.check_signature, async function(req, res, next) {
  const body = req.body;
  console.log("singin...");
  var db_res = await shiwori.dbAccess("SELECT * FROM users WHERE 'e-mail' = '"+body.email+"'");
  if (db_res.length != 1 || db_res[0].password != body.password) {
    res.status(400);
    res.json({"message": "e-mail or password is invalid."});
    return;
  }
  var query = "SELECT * FROM records WHERE user_id = '" + db_res.user_id + "'";
  var user_info = db_res;
  var user_record = await shiwori.dbAccess(query).catch((err) => null);
  query = "SELECT * FROM statistics WHERE user_id = '" + db_res.user_id + "'";
  var user_static = await shiwori.dbAccess(query).catch((err) => null);
  query = "SELECT * FROM bookmarks WHERE user_id = '" + db_res.user_id + "'";
  var user_bookmark = await shiwori.dbAccess(query).catch((err) => null);
  if (user_record == null | user_static == null | user_bookmark == null) {
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
  userdata.userinfo.speed = user_info[0].all_readspeed;
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
  for(var i=0; i>user_bookmark.length; i++) {
    let tmp = {
      "bm_id": user_bookmark[i].bm_id,
      "page_num": user_bookmark[i].page_num,
      "memo": user_bookmark[i].memo,
      "update_date": user_bookmark[i].update_date,
      "book": null
    };
    tmp.book = await shiwori.getBookData(user_bookmark[i].book_id).catch((err) => null);
    userdata.bookmarks.push(tmp);
  }
  // とりあえずこれはYYYY-MM-hogehogeを同じ階層に並べているだけ
  if(!user_static) {
    var keys = Object.keys(user_static[0]);
    for(var i=0; keys.length; i++) {
      userdata.statistics[keys[i]] = user_static[0][keys[i]];
    }
  }
  res.status(200).json(userdata);
});

module.exports = router;
