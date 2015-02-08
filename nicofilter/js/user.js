var id = location.href.split("/user/")[1].split("?")[0];

$.updateDisabled = function() {
    chrome.storage.local.get(id, function(item){
        userData = JSON.parse(item[id]);
        if (userData["disabled"] == 1) {
            userData["disabled"] = 0;
            $(".disabledButton").text("このユーザーを非表示にする");
        } else {
            userData["disabled"] = 1;
            $(".disabledButton").text("このユーザーを非表示にしない");
        }
        var data = {};
        data[id] = JSON.stringify(userData);
        chrome.storage.local.set(data, function(){
            console.log(id + " : user info saved");
        });
    });
}

chrome.storage.local.get(id, function(item){
    if (!item) {
        var profile = $(".profile h2");
        profile.find("small").remove();
        var name = profile.text();
        var user = {id:id, name:name, url:location.href};
        var str = JSON.stringify(user);
        var data = {};
        data[id] = str;
        chrome.storage.local.set(data, function(){
            console.log(id + " : user info saved");
        });
        item = data;
    }
    userData = JSON.parse(item[id]);

    if (userData["disabled"] == 1) {
        var button = "<button class='disabledButton'>このユーザーを非表示にしない</button>";
    } else {
        var button = "<button class='disabledButton'>このユーザーを非表示にする</button>";
    }
    $(".userDetail .avatar").append(button);
    $(".disabledButton").on("click", function(e) {
        $.updateDisabled();
    });
});

