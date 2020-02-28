$(function() {
    // まずスペースを確保してレイアウト崩壊を避ける
    $(".itemTime").append(`<div class="userLink"><span style="color:#999;">（読み込み中…）</span></div><button class="disabler">非表示にする</button>`);

    function updateItem(element, userData, onclick) {
        dbg(`[tag.js-updateItem-始] ID: ${userData['id']}, name: ${userData['name']}`);
        if (onclick !== true) { // 初期化時
            const isCh = userData["isUser"]==false;
            const userUrl = isCh ? `ch.nicovideo.jp/channel/ch${userData['id']}` : `www.nicovideo.jp/user/${userData['id']}`;
            element.find("div.userLink").empty().append(`${isCh?'CH':'BY'}：<a href="https://${userUrl}" target="_blank" rel="noopener">${userData['name']}</a>`);

            element.find(".disabler").on("click", function(e) { // 初期化時はdisablerクリック時ではないのでスルーされる。クリック時はいきなりここに来る
                const id = userData["id"];
                userData["disabled"] = 1;
                const data = {};
                data[id] = JSON.stringify(userData);
                chrome.storage.local.set(data, function() {
                    dbg(`[tag.js-updateItem] ${id}: ユーザーを非表示として保存`);
                    updateItem(element, userData, true);
                });
            });
        }
        if (userData["disabled"] == 1) { // 初期化時で非表示ユーザーの時 or クリックして非表示にした時
            element.find(".itemTime, .uadWrap, .itemContent, .disabler").css({"display":"none"});
            element.append('<div class="dummyTime" style="color:#999;">-</div><div class="disabled">非表示にしました</div><button class="enabler">表示する</button>');
            element.find(".enabler").css({"display":"block"});
            element.find(".enabler").on("click", function(e) { // 初期化時はenablerクリック時ではないのでスルーされる。クリック時はいきなりここに来る
                const id = userData["id"];
                userData["disabled"] = 0;
                const data = {};
                data[id] = JSON.stringify(userData);
                chrome.storage.local.set(data, function() {
                    dbg(`[tag.js-updateItem] ${id}: ユーザーを表示として保存`);
                    updateItem(element, userData, true);
                });
            });
            dbg(`[tag.js-updateItem] ${userData["id"]}: 非表示完了`);
        } else { // 初期化時で非表示ユーザーではない時 or クリックして表示した時
            element.find(".dummyTime, .disabled, .enabler").remove();
            element.find(".itemTime, .uadWrap, .itemContent, .disabler").css({"display":"block"});
            element.find(".enabler").css({"display":"none"});
            dbg(`[tag.js-updateItem] ${userData["id"]}: 表示完了`);
        }
        dbg('[tag.js-updateItem-終] -----');
    }

    // 使う時1に（デバッグ時でさえ常に表示すると邪魔なので）
    if (isDbg && 0) {
        chrome.storage.local.get(function(item) {
            dbg('[tag.js-chrome] item all:');
            console.info(item);
        });
    }

    // 今のところ、遅延させないとニコニ広告のやつが失敗することがある（adPointUrlが'#'になる）
    // できれば再取得ボタンを付けたい
    setTimeout(() => { chrome.storage.local.get("watchList", function(item) {

        dbg('[tag.js-chrome] item:');
        dbg(item);
        const watchList = JSON.parse(item["watchList"] || '{}');
        dbg('[tag.js-chrome] watchList:');
        dbg(watchList);

        $("ul[data-video-list] li.item, .suggestVideo").each(function() {
            const thisObject = $(this);
            let videoId = thisObject.find('.itemThumb').data('id'); // if(!videoId) 内でしか変更されない。実質const
            let isAd = false; // 同上
            if (!videoId) {
                dbg('[tag.js-chrome-!videoId] adPointUrl, videoId:');
                const adPointUrl = thisObject.find('.count.ads a').attr('href');
                dbg(adPointUrl);
                const ptn = /^.+publish\/([a-z]{2}[0-9]+).*?$/;
                videoId = adPointUrl.match(ptn) ? adPointUrl.replace(ptn, '$1') : false;
                isAd = Boolean(videoId);
                dbg(videoId);
            }
            if (videoId) {
                chrome.storage.local.get(videoId, function(item) {
                    const userId = item[videoId];
                    const isAdStr = isAd ? ` - isAd: ${isAd.toString()}` : '';
                    dbg(`[tag.js-chrome-ifVideoId] got userId: ${userId} - videoId of ${videoId}${isAdStr}`);
                    if (!userId) {
                        $.getVideoInfo(thisObject, videoId, function(elem, user) {
                            updateItem(elem, user);
                        });
                    } else {
                        chrome.storage.local.get(userId, function(item) {
                            const user = item[userId];
                            dbg(`[tag.js-chrome-ifUserId] got user data: ${user}`);
                            if (!user) {
                                $.getVideoInfo(thisObject, videoId, function(elem, user) {
                                    updateItem(elem, user);
                                });
                            } else {
                                const userData = JSON.parse(user);
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

    }); }, 500);
});

