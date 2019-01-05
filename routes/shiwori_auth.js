/* shiwori純正アプリからのリクエストか確認するところ。（現在は単に文字列チェックのみである） */
exports.signature = function(req) {
    if (process.env.SHIWORI_SIGNATURE == req.get("X-SHIWORI-Signature")) {
        return true;
    } else false;
}

/* ユーザー認証（現在はヘッダーを見て全部trueを返す）*/
exports.authorization = function(req) {
    return true;
}