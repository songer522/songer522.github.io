---
title: Rewind：那年今日
summary: 一款 iOS 应用，按年份翻出你在「今天」这一天拍过的照片和视频。全部在本机相册完成，不上传任何内容。
status: live
tags: ["iOS", "照片回忆", "独立开发"]
cover: /images/apps/rewind.png
links:
  - { label: "App Store", url: "https://apps.apple.com/us/app/id1137168287" }
  - { label: "GitHub", url: "https://github.com/songer522/PhotoFlashBack" }
featured: true
order: 1
---

Rewind 会扫描你整个相册里与今天同月同日的照片和视频，按年份分组排好——2015 年的今天、
2014 年的今天，一路往回。

## 为什么做这个

苹果和谷歌的工程师太懒了。

Rewind 只做一件事：把相册里同月同日的内容，按年份完整列出来。

## 主要功能

- **那年今日**：跨越整个相册，按年份分组呈现同一天的内容。
- **任意日期**：日期选择器可以跳到一年中的任何一天。
- **媒体筛选**：照片、视频、截图可分别显示或隐藏，选择会被记住。
- **两种排版**：规整的网格，以及错落的马赛克布局，随手切换。
- **全屏浏览**：分页翻看，自定义缩放转场，视频播放，显示拍摄时间与地点名（反向地理编码并做了缓存，避免重复请求），可直接分享或删除。
- **桌面小组件**：WidgetKit 扩展展示今天的回忆，每天午夜刷新。
- **后台刷新**：`BGTaskScheduler` 提前准备好当天的内容，打开即有。

## 技术

主程序用 Swift 和 UIKit 写成，小组件是 SwiftUI 的 WidgetKit 扩展，两者通过 App Group
共享数据。所有内容都直接读取本机的 `PHPhotoLibrary`——没有后端，不上传任何东西。
