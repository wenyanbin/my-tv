function pageUpBySwipe(time) {
    var h = device.height; //屏幕高
    var w = device.width; //屏幕宽
    var x = random((w * 1) / 3, (w * 2) / 3); //横坐标随机。防止检测。
    var h1 = (h / 6) * 5; //纵坐标6分之5处
    var h2 = h / 6; //纵坐标6分之1处
    console.log(time + "ms");
    swipe(x, h1, x, h2, time); //向上翻页(从纵坐标6分之1处拖到纵坐标6分之5处)
}
let s = storages.create("jutime1113132");
let t = s.get("time");
if (t) {
    time = t;
} else {
    time = 600;
}

function eleInScreen(ele) {
    let bounds = ele.bounds();
    return (
        bounds.left >= 0 &&
        bounds.left <= device.width &&
        bounds.top >= 0 &&
        bounds.top <= device.height &&
        bounds.right <= device.width &&
        bounds.right >= 0 &&
        bounds.bottom <= device.height &&
        bounds.bottom >= 0
    );
}

function includeAll() {
    // arguments 对象。是一个类数组对象。包含了函数调用时，传入的所有实参
    for (let i = 0; i < arguments.length; i++) {
        if (text(String(arguments[i])).findOnce() == null) {
            return false;
        }
    }

    return true;
}

function liveAD() {
    //观看直播的界面，autojs捕获不了很多有价值的内容，唯有，倍速，这个关键词，会消失。这一个特征。
    // 在播放界面里面（存在，全x集，或者 存在，剧情简介），且在直播里面（倍速消失）
    let inPlayListPage = text("剧情简介").findOnce() != null && textMatches(/全\d+集/).findOnce() != null;
    let inLivePage = inPlayListPage && text("倍速").findOnce() == null;
    return inLivePage;
}

function netError() {
    return includeAll("全屏观看", "网络出错，请点击重试", "发弹幕", "分享", "继续播放") && !includeAll("倍速");
}


function xSecondsAD() {
    let ele = text("上滑继续观看短剧").findOnce();
    return ele && eleInScreen(ele)
}

function task() {
    let autoScroll = false

    // 可扩展，各种广告方式。类似写法即可。区分打日志，方便观察调试。
    if (xSecondsAD()) {
        console.log("x秒后，继续看剧")
        autoScroll = true
    } else if (liveAD()) {
        console.log("购物直播广告，可直接跳过")
        autoScroll = true
    } else if (netError()) {
        console.log("网络出错，点击重试")
        autoScroll = true
    }

    if (autoScroll) {
        if (pageUp) {
            // 上次翻页了。依然处于广告。增加滑动时间。
            time += 100;
        }

        pageUpBySwipe(time)
        s.put("time", time);
        // 标记翻页了。下一次，如果还是处于广告，就增加翻页时间。动态调整翻页时间。
        pageUp = true

        // 翻页之后，稍微停几秒。无所谓，防止翻页失败，频繁翻页。如果成功，那么程序等待，用户依然也无感知。
        sleep(3000);
    } else {
        pageUp = false
    }

}

pageUp = false;
while (1) {
    task();
    // 监控频率。
    sleep(500);
}