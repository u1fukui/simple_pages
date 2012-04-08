"use strict";

// 位置情報の初期値(新宿)
var DEFAULT_ADDRESS = "新宿";
var DEFAULT_LATITUDE = 35.690921;
var DEFAULT_LONGITUDE = 139.700258;

var address = DEFAULT_ADDRESS;
var lat = DEFAULT_LATITUDE;
var lon = DEFAULT_LONGITUDE;

var maxId;
var nextPage;
var mapCanvas;

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
        initializeMap();
        search();
    }

    // 失敗したとき
    function errorCallback(err) {
        initializeMap();
        search();
    }
}

function initializeMap() {
    var latlng = new google.maps.LatLng(lat, lon);
    var myOptions = {
        zoom: 16,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    mapCanvas = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
}

// formのボタン押されたら実行
function search() {
    var TWEET_COUNT = 100;
    var CALLBACK_FUNCTION = "callbackFunc";
    var RADIUS = "1km";

    var apiUrl = "http://search.twitter.com/search.json";

    if (nextPage != null) {
        apiUrl += nextPage;
    } else {
        apiUrl += "?rpp=" + TWEET_COUNT;
        apiUrl += "&geocode=" + lat + "," + lon + "," + RADIUS;
    }
    apiUrl += "&callback=" + CALLBACK_FUNCTION;

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
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        if (result.geo != null) {
            var lat = result.geo.coordinates[0];
            var lon = result.geo.coordinates[1];
            var latlng = new google.maps.LatLng(lat, lon);

            var marker = new google.maps.Marker({
                position: latlng,
                map: mapCanvas,
                draggable: false,
                animation: google.maps.Animation.DROP,
                icon: result.profile_image_url,
            });

            google.maps.event.addListener(marker, 'click', function() {location.href = "http://twitter.com/#!/" + result.from_user});

            new google.maps.InfoWindow({
                content: convertText(result),
                maxWidth: 200
            }).open(marker.getMap(), marker);
        }
        maxId = result.id_str;
    }
    nextPage = response.next_page;
}


function convertText(result) {
    var convertedText = convertTweet(result.text);
    var convertedTime = convertTweetTime(result.created_at);

    var html = "";
    html += "<div class=\"content-right-header\">";
    html +=     "<strong class=\"from_user_name\">" + result.from_user_name + "</strong>";
    html +=     "  <span class=\"from_user\">@" + result.from_user + "</span>";
    html += "</div>";
    html += "<div class=\"text\">" + convertedText + "</div>";
    html += "<div class=\"content-right-footer\">";
    html +=     "<span class=\"created_at\">" + convertedTime + "</span>";
    html += "</div>";
    return html;
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
