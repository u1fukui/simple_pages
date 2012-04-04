// 位置情報の初期値(新宿)
var DEFAULT_ADDRESS = "新宿";
var DEFAULT_LATITUDE = 35.690921;
var DEFAULT_LONGITUDE = 139.700258;

var address = DEFAULT_ADDRESS;
var lat = DEFAULT_LATITUDE;
var lon = DEFAULT_LONGITUDE;

var maxId;
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
        getAddress();
        search();
    }

    // 失敗したとき
    function errorCallback(err) {
        //alert("失敗(" + err.code + ")" + err.message);
        initializeMap();
        //printTitle();
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

    var apiUrl = "http://search.twitter.com/search.json" +
        "?rpp=" + TWEET_COUNT +
        "&callback=" + CALLBACK_FUNCTION +
        "&geocode=" + lat + "," + lon + "," + RADIUS;

    if (maxId != null) {
        apiUrl += "&max_id=" + maxId;
    }

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

            console.log(result.profile_image_url);

            var marker = new google.maps.Marker({
                position: latlng,
                map: mapCanvas,
                draggable: false,
                animation: google.maps.Animation.DROP,
                icon: result.profile_image_url
            });
        }
        maxId = result.id_str;
    }
 }