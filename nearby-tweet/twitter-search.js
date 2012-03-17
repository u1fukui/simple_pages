// formのボタン押されたら実行
function search() {
    // API URL生成
    var searchWord = document.form.text.value;
    var apiUrl = "http://search.twitter.com/search.json?rpp=3&callback=callbackFunc"
        + "&q=" + encodeURIComponent(searchWord);

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
    document.getElementById("response").innerHTML = objectToHtml(response);
}

// レスポンスを表示
function objectToHtml(object) {
    var html = "";
    for (var prop in object) {
        // プロパティ名
        html += "<dt>" + prop + "</dt>";

        // 値
        if (typeof object[prop] == "object") {
            var o = object[prop];
            html += "<dd>" + objectToHtml(o) + "</dd>";
        } else {
            html += "<dd>" + object[prop] + "</dd>";
        }
    }
    return "<dl>" + html + "</dl>";
}