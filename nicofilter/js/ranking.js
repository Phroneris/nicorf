
$(function(){
    function updateRanking(rankingElement, userData, onclick) {
        console.log(userData['id']+': '+userData['name']);
        var p = rankingElement.find("p.itemTime");
        var html = p.html();
        if (onclick !== true) {
            if (userData["isUser"] == false) {
                html = html + "<br/>BY：" + userData['name'] + "（ch）<br/>";
            } else {
                html = html + "<br/>BY： <a href=\"https://www.nicovideo.jp/user/" + userData['id'] + "\">" + userData['name'] + "</a><br/>";
            }
            p.html(html);

            rankingElement.find(".rankingNumWrap").append('<a href="javascript:void(0)" class="disabler">非表示にする</a>');
            rankingElement.find(".rankingNumWrap").append('<a href="javascript:void(0)" class="enabler">表示する</a>');
            rankingElement.find(".disabler").on("click", function(e){
                userData["disabled"] = 1;
                var id = userData["id"];
                var data = {};
                data[id] = JSON.stringify(userData);
                chrome.storage.local.set(data, function(){
                    console.log(id + " : user info saved");
                    updateRanking(rankingElement, userData, true);
                });
            });
            rankingElement.find(".enabler").on("click", function(e){
                var id = userData["id"];
                userData["disabled"] = 0;
                var data = {};
                data[id] = JSON.stringify(userData);
                chrome.storage.local.set(data, function(){
                    console.log(id + " : user info saved");
                    updateRanking(rankingElement, userData, true);
                });
            });
        }

        if (userData["disabled"] == 1) {
            rankingElement.find(".videoList01Wrap").css({"display":"none"});
            rankingElement.find(".itemContent").css({"display":"none"});
            rankingElement.append("<div class='disabled'>非表示にしました</div>");
            rankingElement.find(".disabler").css({"display":"none"});
            rankingElement.find(".enabler").css({"display":"block"});
        } else {
            rankingElement.find(".disabled").remove();
            rankingElement.find(".videoList01Wrap").css({"display":"block"});
            rankingElement.find(".itemContent").css({"display":"table"});
            rankingElement.find(".disabler").css({"display":"block"});
            rankingElement.find(".enabler").css({"display":"none"});
        }
    };

    chrome.storage.local.get("watchList", function(item) {
        var watchList = item["watchList"];
        if (!watchList) {
            watchList = {};
        } else {
            watchList = JSON.parse(watchList);
        }

        $("li.item.videoRanking").each(function() {
            var thisObject = $(this);
            var videoId = thisObject.attr('data-video-id');
            if (!videoId) {
              return;
            }
            console.log(videoId);
            chrome.storage.local.get(videoId, function(item){
                var userId = item[videoId];
                console.log('got userId:'+userId+" - videoId of "+videoId);
                if(!userId){
                    $.getVideoInfo(thisObject, videoId, function(elem, user){
                        updateRanking(elem, user);
                    });
                }else{
                    chrome.storage.local.get(userId, function(item){
                        var user = item[userId];
                        console.log('got user data:'+user);
                        if(!user){
                            $.getVideoInfo(thisObject, videoId, function(elem, user){
                                updateRanking(elem, user);
                            });
                        }else{
                            userData = JSON.parse(user);
                            updateRanking(thisObject, userData);
                        }
                    });
                }
            });

            if (watchList[videoId]) {
                console.log("videoId:"+videoId+"---"+watchList[videoId]);
                thisObject.css({opacity:0.3});
                var numWrap = thisObject.find("div.rankingNumWrap");
                numWrap.append('<p>視聴済み:'+watchList[videoId]+'回</p>');
            }
        });
    });
});
