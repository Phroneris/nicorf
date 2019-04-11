$(function(){
    function updateItem(element, userData, onclick){
        dbg(`[tag.js-updateItem-start] ${userData['id']}: ${userData['name']}`);
        var p = element.find("p.itemTime");
        var html = p.html();
        if (onclick !== true) {
            if (userData["isUser"] == false) {
                html = html + `<br/>BY： ${userData['name']}（ch）`;
            } else {
                html = html + `<br/>BY： <a href="https://www.nicovideo.jp/user/${userData['id']}">${userData['name']}</a>`;
            }
            html = html + '<br/>';
            html = html + '<button class="disabler">非表示にする</button>';
            p.html(html);

            element.find(".disabler").on("click", function(e){
                var id = userData["id"];
                userData["disabled"] = 1;
                var data = {};
                data[id] = JSON.stringify(userData);
                chrome.storage.local.set(data, function(){
                    dbg(`[tag.js-updateItem-nowDisabled] ${id}: user info saved`);
                    updateItem(element, userData, true);
                });
            });
        }
        if (userData["disabled"] == 1) {
            element.find(".itemTime").css({"display":"none"});
            element.find(".uadWrap").css({"display":"none"});
            element.find(".itemContent").css({"display":"none"});
            element.append('<div class="disabled">非表示にしました</div>');
            element.append('<button class="enabler">表示する</button>');
            element.find(".disabler").css({"display":"none"});
            element.find(".enabler").css({"display":"block"});
            element.find(".enabler").on("click", function(e){
                var id = userData["id"];
                userData["disabled"] = 0;
                var data = {};
                data[id] = JSON.stringify(userData);
                chrome.storage.local.set(data, function(){
                    dbg(`[tag.js-updateItem-nowEnabled] ${id}: user info saved`);
                    updateItem(element, userData, true);
                });
            });
        } else {
            element.find(".disabled").remove();
            element.find(".enabler").remove();
            element.find(".itemTime").css({"display":"block"});
            element.find(".uadWrap").css({"display":"block"});
            element.find(".itemContent").css({"display":"block"});
            element.find(".disabler").css({"display":"block"});
            element.find(".enabler").css({"display":"none"});
        }
    };

    if (isDbg && 0) { // 使う時1に
        chrome.storage.local.get(function(item){
            dbg('[tag.js-chrome] item all:');
            console.info(item);
        });
    }
    setTimeout(() => {
    // 今の所こうしないとニコニ広告のやつが高確率で失敗する（adPointUrlが'#'になる）
    // できれば再取得ボタンを付けたい

    chrome.storage.local.get("watchList", function(item){
        dbg('[tag.js-chrome] item:');
        dbg(item);
        var watchList = item["watchList"];
        if (!watchList) {
            watchList = {};
        } else {
            watchList = JSON.parse(watchList);
        }
        dbg('[tag.js-chrome] watchList:');
        dbg(watchList);

        $("ul[data-video-list] li.item").each(function(){
            var thisObject = $(this);
            var videoId = thisObject.find('.itemThumb').data('id');
            var isAd = false;
            if(!videoId) {
                dbg('[tag.js-chrome-!videoId] adPointUrl, videoId:');
                const adPointUrl = thisObject.find('.count.ads a').attr('href');
                dbg(adPointUrl);
                const ptn = /^.+publish\/([a-z]{2}[0-9]+).*?$/;
                videoId = adPointUrl.match(ptn) ? adPointUrl.replace(ptn, '$1') : false;
                isAd = videoId ? true : false;
                dbg(videoId);
            }
            if (videoId) {
                chrome.storage.local.get(videoId, function(item){
                    var userId = item[videoId];
                    const isAdStr = isAd ? ` - isAd: ${isAd.toString()}` : '';
                    dbg(`[tag.js-chrome-ifVideoId] got userId: ${userId} - videoId of ${videoId}${isAdStr}`);
                    if(!userId){
                        $.getVideoInfo(thisObject, videoId, function(elem, user){
                            updateItem(elem, user);
                        });
                    }else{
                        chrome.storage.local.get(userId, function(item){
                            var user = item[userId];
                            dbg(`[tag.js-chrome-ifUserId] got user data: ${user}`);
                            if(!user){
                                $.getVideoInfo(thisObject, videoId, function(elem, user){
                                    updateItem(elem, user);
                                });
                            }else{
                                userData = JSON.parse(user);
                                updateItem(thisObject, userData);
                            }
                        });
                    }
                });

                if (watchList[videoId]) {
                    dbg(`[tag.js-chrome-ifWlVideoId] videoId: ${videoId} --- ${watchList[videoId]}`);
                    thisObject.css({opacity:0.3});
                }
            }
        });
    });

    }, 500);
});

