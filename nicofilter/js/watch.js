$(function(){
    var url = location.href;
    url = url.replace(/\?.*$/, ""); // パラメータ削除
    var array = url.split('/');
    var videoId = array.pop();
    // 3文字以下なら後ろのゴミが取得されてる
    if (videoId.length < 3) {
        videoId = array.pop();
    }
    var key = "watch"+videoId;
    chrome.storage.local.get(["watchList"], function(item) {

        var list = item["watchList"];
        if (!list) {
            list = {videoId:1};
        } else {
            list = JSON.parse(list);
            if (!list[videoId]) {
                list[videoId] = 1;
            } else {
                var count = list[videoId];
                list[videoId] = count+1;
            }
        }
        list = JSON.stringify(list);

        chrome.storage.local.set({"watchList":list}, function() {
            console.log("watch list updated");
        });
    });
});
