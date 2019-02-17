var connection = require('./mysql_connection');
const request = require('request');
var moment = require('moment');

/* shiwori純正アプリからのリクエストか確認するところ。（現在は単に文字列チェックのみである） */
exports.check_signature = function(req, res, next) {
    console.log("署名確認");
    if (process.env.SHIWORI_SIGNATURE == req.get("X-SHIWORI-Signature")) {
        next();
    } else {
        res.status(401).end();
        return;
    }
}

/* ユーザー認証（現在はヘッダーを見て全部trueを返す）*/
exports.authorization = function(req) {
    console.log("ユーザー認証");
    return true;
}

/* await対応のrequest関数 */
exports.doRequest = function(option) {
    return new Promise(function(resolve, reject) {
        request(option, function(error, res, body) {
            if(!error && res.statusCode == 200) {
                resolve(JSON.parse(body));
            } else {
                console.log(error);
                console.log(res.status);
                reject(error);
            }
        });
    });
}

/* await対応のデータベースアクセス */
exports.dbAccess = function(query) {
    return new Promise(function(resolve, reject) {
        connection.query(query, function(err, rows) {
            if(err) {
                console.log(err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

exports.getBookData = async function(googleId) {
    const option = {
        method: "GET",
        url: "https://www.googleapis.com/books/v1/volumes/" + googleId
    }
    const body = await module.exports.doRequest(option).catch(() => null);
    if(!body) {
        throw new Error("request null");
        return null;
    }
    var book = {
        "book_id": body.id,
        "title": body.volumeInfo.title,
        "author": "情報なし",
        "imgUrl": {
            "thumbnail": null,
            "smallThumbnail": null,
            "small": null,
            "medium": null,
            "large": null
        },
        "publication": body.volumeInfo.publisher,
        "page": body.volumeInfo.pageCount
    };
    if("imageLinks" in body.volumeInfo) {
        if("thumbnail" in body.volumeInfo.imageLinks) book.imgUrl.thumbnail = body.volumeInfo.imageLinks.thumbnail;
        if("smallThumbnail" in body.volumeInfo.imageLinks) book.imgUrl.smallThumbnail = body.volumeInfo.imageLinks.smallThumbnail;
        if("small" in body.volumeInfo.imageLinks) book.imgUrl.small = body.volumeInfo.imageLinks.small;
        if("medium" in body.volumeInfo.imageLinks) book.imgUrl.medium = body.volumeInfo.imageLinks.medium;
        if("large" in body.volumeInfo.imageLinks) book.imgUrl.large = body.volumeInfo.imageLinks.large;
    }
    if(typeof(body.volumeInfo.authors) == "object") {
        book.author = body.volumeInfo.authors.join(",");
    }
    return book;
}

exports.getNowTime = function() {
    var m = moment();
    var datetime = m.format("YYYY-MM-DD-HH:mm:ss");
    return datetime;
}