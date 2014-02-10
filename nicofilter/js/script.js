$(function(){

    function getVideoInfo(thisObject, id, callback){
        $.ajax({
            type: 'GET',
            url: 'http://www.nicochart.jp/watch/' + id,
            dataType: 'html',
            success: function(data, textStatus, jqXHR){
                var url = $("em.user a.nicovideo-link", data).attr("href");
                var userId = url ? url.match(/[0-9]+$/)[0] : null;
                var name = $("em.name", data).find("a").html();
                console.log("url: "+url+", id:"+userId+", name:"+name);
                if(url != undefined && id != undefined && name != undefined){
                    var user = {"id":userId, "name":name, "url":url};
                    var str = JSON.stringify(user);
                    var item = {};
                    item[userId] = str;
                    item[id] = userId;
                    chrome.storage.local.set(item, function(){
                        // console.log('item saved id:'+id);
                    });
                    callback(thisObject, user);
                }else{
                    console.log("error id="+id+": ");
                    if(!url) url = "取得に失敗しました";
                    if(!userId) userId = "取得に失敗しました";
                    if(!name) name = "取得に失敗しました";
                    chrome.storage.local.get(userId, function(item){
                        if(item[userId] != undefined){
                            callback(thisObject, JSON.parse(item[userId]));
                        }else{
                            callback(thisObject, {"id":userId, "name":name, "url":url});
                        }
                    });
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                console.log("error id="+id+": ");
                console.log(errorThrown);
            },
            complete: function(jqXHR, textStatus){
            }
        });
    };

    function updateRanking(rankingElement, userData){
        // console.log(userData['id']+': '+userData['name']);
        var p = rankingElement.find("p.itemTime");
        var html = p.html();
        html = html + "<br/>BY： " + userData['name'];
        p.html(html);
    };

    $("li.item.videoRanking").each(function(){
        var thisObject = $(this);
        var videoId = thisObject.data('id');
        chrome.storage.local.get(videoId, function(item){
            var userId = item[videoId];
            // console.log('got userId:'+userId+" - videoId of "+videoId);
            if(!userId){
                getVideoInfo(thisObject, videoId, function(elem, user){
                    updateRanking(elem, user);
                });
            }else{
                chrome.storage.local.get(userId, function(item){
                    var user = item[userId];
                    // console.log('got user data:'+user);
                    if(!user){
                        getVideoInfo(thisObject, videoId, function(elem, user){
                            updateRanking(elem, user);
                        });
                    }else{
                        userData = JSON.parse(user);
                        updateRanking(thisObject, userData);
                    }
                });
            }
        });
    });
});
