function main() {
    // Geolocationに対応してるかチェック
    if (navigator.geolocation == undefined) {
        alert("位置情報の取得に未対応です");
        return;
    }

    // 位置情報の取得
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

    // 成功したとき
    function successCallback(pos) {
        var lat = pos.coords.latitude;
        var lon = pos.coords.longitude;

        search(lat, lon);
    }

    // 失敗したとき
    function errorCallback(err) {
        //alert("失敗(" + err.code + ")" + err.message);

        // 位置情報の初期値(新宿)
        var DEFAULT_LATITUDE = 35.690921;
        var DEFAULT_LONGITUDE = 139.700258;

        search(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
    }
}

// formのボタン押されたら実行
function search(lat, lon) {
    var TWEET_COUNT = 100;
    var CALLBACK_FUNCTION = "callbackFunc";
    var RADIUS = "1km";

    var apiUrl = "http://search.twitter.com/search.json" +
        "?rpp=" + TWEET_COUNT +
        "&callback=" + CALLBACK_FUNCTION +
        "&geocode=" + lat + "," + lon + "," + RADIUS;

    callJSONP(apiUrl);
}

// script要素追加
function callJSONP(url) {
    var target = document.createElement('script');
    target.charset = 'utf-8';
    target.src = url;
    document.body.appendChild(target);
}

// コールバック関数
function callbackFunc(response) {
    var results = response.results;

    var html = "<ul class=\"content-list\">";
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        if (result.geo != null) {
            var convertedText = convertTweet(result.text);
            var convertedTime = convertTweetTime(result.created_at);

            html += "<li class=\"content\">";
            html += "<div class=\"content-left\"><img class=\"profile-image\" src=\"" + result.profile_image_url + "\" /></div>";
            html += "<div class=\"content-right\">";
            html += "<div class=\"from_user\">" + result.from_user + "</div>";
            html += "<div class=\"text\">" + convertedText + "</div>";
            html += "<div class=\"created_at\">" + convertedTime + "</div>";
            html += "</div>";
            html += "</li>";
        }
    }
    html += "</ul>";

    document.getElementById("timeline").innerHTML = html;
 }

// テキストにリンクを付ける
function convertTweet(text) {
    //URLにリンクを付ける
    text = text.replace(/(s?https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:@&=+$,%#]+)/gi,'<a href="$1">$1</a>');
    //ハッシュタグにリンク
    text = text.replace(/#(\w+)/gi,'<a href="http://twitter.com/search?q=%23$1">#$1</a>');
    //リプライにリンク
    text = text.replace(/@(\w+)/gi,'<a href="http://twitter.com/$1">@$1</a>');
    return text;
}

// 時間を見やすい形式に変換
function convertTweetTime(time) {
    var ms = Date.parse(time); // ミリ秒に変換
    var d = new Date(ms);
    var mon1 = d.getMonth() + 1;
    var day1 = d.getDate();
    var h1 = d.getHours();
    var m1 = d.getMinutes();
    var s1 = d.getSeconds();
    return mon1 + "/" + day1 + " " + fix(h1) + ":" + fix(m1) + ":" + fix(s1);
}

// 2桁にする
function fix(n) {
    if (n < 10)
        return "0" + n;
    return n;
};