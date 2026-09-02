---
title: Track Lapse：跑酷游戏
summary: 我 2012 年在第一份工作里做的第一款 iOS 游戏，用 cocos2d 写成。现在正在把它重新跑起来。
status: wip
tags: ["iOS", "游戏", "cocos2d"]
cover: /images/apps/track-lapse.png
links:
  - { label: "GitHub", url: "https://github.com/songer522/Clay" }
featured: true
order: 3
---

一款横版跑酷平台游戏：穿过一关关不同主题的关卡，躲避和踢开路上的障碍，追着时间跑金银铜牌。

## 一点背景

这是我做的第一款 iOS 游戏，2012 年，在我的第一份工作里。那家公司现在已经不在了，游戏也早
就从 App Store 下架，现在没有任何地方能下载到它。

工程和源码里一直沿用当年的代号 **Clay**，而上架时的名字是 **Track Lapse**。

## 游戏内容

八个主题关卡——Track Run、Barn Run、Town Run、Disco Run、City Run、Undead Run、
Computer Run、Volcano Run。障碍之间可以连锁反应：把鸡踢向牛，撞翻滚动的干草堆，或者一串
僵尸。关卡之间用漫画分镜过场，后面的关卡以 Boss 战收尾。

![Disco Run 关卡](/images/apps/track-lapse-disco.png)

![Computer Run 关卡](/images/apps/track-lapse-computer.png)

![Undead Run 关卡](/images/apps/track-lapse-undead.png)

*当年 App Store 上的截图。*

## 现在做到哪了

代码是 Objective-C，跑在 cocos2d-iphone 上，第三方库全部内联在仓库里。目前它已经能用现在
的 iOS SDK 编译运行了，但排版还是当年那套按帧写死的布局，只按 3.5 英寸和 9.7 英寸的屏幕
比例设计，所以在今天的设备上还不能正常显示——这是接下来要解决的部分。

会不会再上架，我还没有答案。至少先把它放在 GitHub 上。
