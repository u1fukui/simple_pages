// 位置情報の初期値(新宿)
var DEFAULT_ADDRESS = "新宿";
var DEFAULT_LATITUDE = 35.690921;
var DEFAULT_LONGITUDE = 139.700258;

var address = DEFAULT_ADDRESS;
var lat = DEFAULT_LATITUDE;
var lon = DEFAULT_LONGITUDE;

var maxId;
var nextPage;

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
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;

        getAddress();
        search();
    }

    // 失敗したとき
    function errorCallback(err) {
        //alert("失敗(" + err.code + ")" + err.message);
        printTitle();
        search();
    }
}

// 緯度・経度から住所を取得
function getAddress() {
    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(lat, lon);
    geocoder.geocode({
        latLng: latlng
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0].geometry) {
                address = results[0].formatted_address.replace(/^日本, /, '');
                printTitle();
                return;
            }
        }
        address = "現在地";
        printTitle();
    });
}

// タイトルをHTMLに出力
function printTitle() {
    document.getElementById("title").innerHTML = address + "<br>付近のツイート";
}

// formのボタン押されたら実行
function search() {
    var TWEET_COUNT = 100;
    var CALLBACK_FUNCTION = "callbackFunc";
    var RADIUS = "1km";

    var apiUrl = "http://search.twitter.com/search.json";

    if (nextPage != null) {
        apiUrl += nextPage.toString();
    } else {
        apiUrl += "?rpp=" + TWEET_COUNT;
        apiUrl += "&geocode=" + lat + "," + lon + "," + RADIUS;
    }
    apiUrl += "&callback=" + CALLBACK_FUNCTION;
    console.log(apiUrl);
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
    var html = document.getElementById("timeline").innerHTML;
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        if (result.geo != null) {
            var convertedText = convertTweet(result.text);
            var convertedTime = convertTweetTime(result.created_at);
            var lat = result.geo.coordinates[0];
            var lon = result.geo.coordinates[1];

            html += "<li class=\"content\">";
            html += "<div class=\"content-left\">";
            html +=     "<img class=\"profile-image\" src=\"" + result.profile_image_url + "\" />";
            html += "</div>";
            html += "<div class=\"content-right\">";
            html +=     "<div class=\"content-right-header\">";
            html +=         "<strong class=\"from_user_name\">" + result.from_user_name + "</strong>";
            html +=         "  <span class=\"from_user\">@" + result.from_user + "</span>";
            html +=     "</div>";
            html +=     "<div class=\"text\">" + convertedText + "</div>";
            html +=     "<div class=\"content-right-footer\">";
            html +=         "<span class=\"created_at\">" + convertedTime + "</span>";
            html +=         "  <a href=\"http://maps.google.co.jp/maps?q=" + lat + "," + lon + "\"><img class=\"map-icon\" src=\"Maps.png\"/></a>";
            html +=     "</div>";
            html += "</div>";
            html += "</li>";
        }
        maxId = result.id_str;
    }
    nextPage = response.next_page;
    console.log(nextPage);
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
    return mon1 + "月" + day1 + "日 " + fix(h1) + "時" + fix(m1) + "分";
}

// 2桁にする
function fix(n) {
    if (n < 10)
        return "0" + n;
    return n;
};