// GoogleMap
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
        var lat = pos.coords.latitude;
        var lon = pos.coords.longitude;

        initializeMap(lat, lon);
        search(lat, lon);
    }

    // 失敗したとき
    function errorCallback(err) {
        alert("失敗(" + err.code + ")" + err.message);

        // 位置情報の初期値(新宿)
        var DEFAULT_LATITUDE = 35.690921;
        var DEFAULT_LONGITUDE = 139.700258;

        initializeMap(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
        search(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
    }


}

// GoogleMap初期化
function initializeMap(lat ,lon) {
    // 地図生成
    var latlng = new google.maps.LatLng(lat, lon);
    var myOptions = {
        zoom: 15,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    mapCanvas = new google.maps.Map(document.getElementById("map"), myOptions);
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
    var bounds = new google.maps.LatLngBounds();
    var hitCount = 0; // geoの入っているツイート数

    var results = response.results;
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        if (result.geo != null) {
            var pos = result.geo.coordinates;
            var ll = new google.maps.LatLng(pos[0], pos[1]);
            var marker = new google.maps.Marker({
                position: ll,
                map: mapCanvas,
                draggable: false,
                animation: google.maps.Animation.DROP,
                icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=T|46b6d8|46b6d8'
            });
            bounds.extend(ll);
            hitCount++;
        }
    }

    // マーカーが全部入るように地図の拡大率を調整
    if (hitCount > 0) {
        mapCanvas.fitBounds(bounds);
    }
}