var mapCanvas;

function initialize() {
    var latlng = new google.maps.LatLng(35.690921,139.700258);
    var myOptions = {
        zoom: 16,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    mapCanvas = new google.maps.Map(document.getElementById("map"), myOptions);

}


// formのボタン押されたら実行
function search() {
    var TWEET_COUNT = 100;
    var CALLBACK_FUNCTION = "callbackFunc";

    // API URL生成
    var searchWord = document.form.text.value;
    var apiUrl = "http://search.twitter.com/search.json" +
        "?rpp=" + TWEET_COUNT +
        "&callback=" + CALLBACK_FUNCTION +
        "&geocode=35.690921,139.700258,1km";
    //"&q=" + encodeURIComponent(searchWord);

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
            var pos = result.geo.coordinates;
            var ll = new google.maps.LatLng(pos[0], pos[1]);
            var marker = new google.maps.Marker({
                position: ll,
                map: mapCanvas,
                draggable: false,
                animation: google.maps.Animation.DROP,
                icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=T|46b6d8|46b6d8'
            });
        }
    }
}