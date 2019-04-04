$(function(){
    function updateItem(element, userData, onclick){
        console.log('[tag.js-updateItem-start] '+userData['id']+': '+userData['name']);
        var p = element.find("p.itemTime");
        var html = p.html();
        if (onclick !== true) {
            if (userData["isUser"] == false) {
                html = html + "<br/>BY： " + userData['name'] + "（ch）";
            } else {
                html = html + "<br/>BY： <a href=\"https://www.nicovideo.jp/user/" + userData['id'] + "\">" + userData['name'] + "</a>";
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
                    console.log('[tag.js-updateItem-onclick] '+id + " : user info saved");
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
                    console.log('[tag.js-updateItem-disabled] '+id + " : user info saved");
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

    chrome.storage.local.get(function(item){
        console.log('[tag.js-chrome] item all:');
        console.info(item);
    });
    chrome.storage.local.get("watchList", function(item){
        console.log('[tag.js-chrome] item:');
        console.log(item);
        var watchList = item["watchList"];
        if (!watchList) {
            watchList = {};
        } else {
            watchList = JSON.parse(watchList);
        }
        console.log('[tag.js-chrome] watchList:');
        console.log(watchList);

        $("li.item").each(function(){
            var thisObject = $(this);
            var videoId = thisObject.find('.itemThumb').data('id');
            if (videoId) {
                chrome.storage.local.get(videoId, function(item){
                    var userId = item[videoId];
                    console.log('[tag.js-chrome-ifVideoId] '+'got userId:'+userId+" - videoId of "+videoId);
                    if(!userId){
                        $.getVideoInfo(thisObject, videoId, function(elem, user){
                            updateItem(elem, user);
                        });
                    }else{
                        chrome.storage.local.get(userId, function(item){
                            var user = item[userId];
                            console.log('[tag.js-chrome-ifUserId] '+'got user data:'+user);
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
                    console.log('[tag.js-chrome-ifWlVideoId] '+"videoId:"+videoId+"---"+watchList[videoId]);
                    thisObject.css({opacity:0.3});
                }
            }
        });
    });
});

