$(function() {

    $("div.ranking_video").on("click", ".disabler", function(e) {
        var visible = 1
        onClickToggle($(this), visible)
    })

    $("div.ranking_video").on("click", ".enabler", function(e) {
        var visible = 0
        onClickToggle($(this), visible)
    })

    var onClickToggle = function(that, visible) {
        var el = that.closest("div.ranking_video")
        var id = el.data('user')
        updateRanking(el, visible)
        updateVisible(id, visible)
    }

    var updateVisible = function(id, visible) {
        var data = {}
        userData["disabled"] = visible
        data[id] = JSON.stringify(userData)
        chrome.storage.local.set(data, function() {
            console.log(id + " : user info saved")
        })
    }

    var updateRanking = function(el, visible) {
        var id = el.data('user')
        // console.log(id, visible)
        if (visible == 1) {
            $("div.ranking_video[data-user=" + id + "]").find('div.toggle').addClass('disabled')
            $("div.ranking_video[data-user=" + id + "]").find('div.toggle').removeClass('enabled')
            $("div.ranking_video[data-user=" + id + "]").find('div.info').addClass('disabled')
            $("div.ranking_video[data-user=" + id + "]").find('div.info').removeClass('enabled')
        } else {
            $("div.ranking_video[data-user=" + id + "]").find('div.toggle').addClass('enabled')
            $("div.ranking_video[data-user=" + id + "]").find('div.toggle').removeClass('disabled')
            $("div.ranking_video[data-user=" + id + "]").find('div.info').addClass('enabled')
            $("div.ranking_video[data-user=" + id + "]").find('div.info').removeClass('disabled')
        }
    }

    var initialize = function() {
        if ($(".disabledContent").length == 0) {
            $("div.ranking_video").each(function() {
                var that = $(this)
                var userLink = that.find("span.name a")
                try {
                    var userId = userLink.attr("href").split("/user/")[1]
                    if (userId.indexOf("?") > 0) {
                        userId = userId.split("?")[0]
                    }
                } catch (e) {
                    var userId = null
                }

                if (userId) {
                    that.attr('data-user', userId)

                    chrome.storage.local.get(userId, function(item) {
                        var user = item[userId];
                        // console.log('got user data:'+user);
                        if (user) {
                            userData = JSON.parse(user)
                            if (userData['disabled'] == 1) {
                                updateRanking(that, 1)
                            }
                        }
                    })

                    var div = '<div class="toggle">'
                    div += '<p><a href="javascript:void(0)" class="disabler">非表示にする</a></p>'
                    div += '<p class="disabledContent"><a href="javascript:void(0)" class="enabler disabledContent">表示する</a></p>'
                    div += '</div>'
                    that.find('div.rank').append(div)
                    that.find('div.rankFuture').append(div)
                    that.find('div.rankPast').append(div)
                    that.find('.info').append('<div class="disabledContent floatingMessage">非表示にしました</div>')
                    updateRanking(that, 0)
                }
            })
        }
    }

    // 変更を監視して初期化
    setInterval(initialize, 3000)
    initialize()

})
