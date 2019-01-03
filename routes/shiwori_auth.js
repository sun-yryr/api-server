/* shiwori純正アプリからのリクエストか確認するところ。（現在は単に文字列チェックのみである） */
exports.signature = function(checkString) {
    if (process.env.SHIWORI_SIGNATURE == checkString) {
        return true;
    } else false;
}

/* ユーザー認証（現在はヘッダーを見て全部trueを返す）*/
exports.authorization = function(header) {
    return true;
}