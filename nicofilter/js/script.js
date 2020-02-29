// デバッグ時1に
const isDbg = 0
const dbg = v => { if(isDbg){console.log(v);} };

$.getVideoInfo = function(thisObject, id, callback) {
    const failedStr = "取得に失敗しました";
    $.ajax({
        type: 'GET',
        url: `https://cors-anywhere.herokuapp.com/https://ext.nicovideo.jp/api/getthumbinfo/${id}`,
        dataType: 'html',
        success: function(data, textStatus, jqXHR) {
            const url    = $("watch_url"    , data).text();
            const userId = $("user_id"      , data).text();
            const name   = $("user_nickname", data).text();
            const chId   = $("ch_id"        , data).text();
            const chName = $("ch_name"      , data).text();
            dbg(`[script.js] url: ${url}, id: ${userId}, name: ${name}`);
            if (url != undefined && id != '' && name != '') {
                const user = {"id":userId, "name":name, "url":url, "isUser":true};
                const str = JSON.stringify(user);
                chrome.storage.local.get(userId, function(result) {
                    if (result[userId] != undefined) {
                        callback(thisObject, JSON.parse(result[userId]));
                    } else {
                        const item = {};
                        item[userId] = str;
                        item[id] = userId;
                        chrome.storage.local.set(item, function() {
                            dbg(`[script.js-video] item saved id: ${id}`);
                        });
                        callback(thisObject, user);
                    }
                });
            } else if (url != undefined && chId != '' && chName != '') {
                const user = {"id":chId, "name":chName, "url":url, "isUser":false};
                const str = JSON.stringify(user);
                chrome.storage.local.get(chId, function(result) {
                    if (result[chId] != undefined) {
                        callback(thisObject, JSON.parse(result[chId]));
                    } else {
                        const item = {};
                        item[chId] = str;
                        item[id] = chId;
                        chrome.storage.local.set(item, function() {
                            dbg(`[script.js-channel] item saved id: ${id}`);
                        });
                        callback(thisObject, user);
                    }
                });
            } else {
                dbg(`[script.js-else] error id=${id}: dataは取れたが中身を取れなかった`);
                const maybeUserId = userId || failedStr;
                chrome.storage.local.get(maybeUserId, function(item) {
                    if (item[maybeUserId] != undefined) {
                        callback(thisObject, JSON.parse(item[maybeUserId]));
                    } else {
                        const maybeUrl  = url  || failedStr;
                        const maybeName = name || failedStr;
                        callback(thisObject, {"id":maybeUserId, "name":maybeName, "url":maybeUrl, "isFailed":true});
                    }
                });
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            dbg(`[script.js-error] error id=${id}: data自体取れなかった`);
            const errorStr = errorThrown || failedStr
            dbg(errorStr);
            callback(thisObject, {"name":errorStr, "isFailed":true});
        },
        complete: function(jqXHR, textStatus) {
        }
    });
};

