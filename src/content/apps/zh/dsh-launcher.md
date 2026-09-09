---
title: DSH Launcher：DeepSeek Harness 菜单栏启动器
summary: 一个极简的 macOS 菜单栏工具，用来管理本地开发服务器：启动、打开、重启、停止，全程不碰终端。原生 AppKit，单个 Swift 文件，零依赖。
status: free-tool
tags: ["macOS", "Swift", "AppKit", "开发工具"]
cover: /images/apps/dsh-launcher.png
icon: /images/apps/dsh-launcher-icon.svg
links:
  - { label: "GitHub", url: "https://github.com/songer522/dsh-launcher" }
featured: true
order: 4
---
DSH Launcher 把本地开发服务器搬进了 macOS 菜单栏：启动、在浏览器里打开、拉完代码后重启、
用完停掉——都是一次点击，全程不用碰终端。它没有 Dock 图标，不占地方。

它是为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 写的，但命令、
端口、项目目录和浏览器都可以配置，所以任意长期运行的本地服务它都能带。

## 为什么做这个

每次我想用 DeepSeek Harness，从源码运行就意味着必须从终端运行：

```sh
cd ~/Workspace/deepseek-harness
pnpm dsh web
```

命令本身很小，但它周围那套仪式不小。整个会话期间终端标签页都得开着；拉了新改动就要回到终端、
杀掉服务器、再重新启动；带进程级 token 的 URL 得从日志里复制出来；会话结束还得手动停掉，
否则它一直占着端口。

而所有真正的工作都发生在浏览器标签页里。终端从来不是这个工具的重点——它只是入口处的收费站。
所以我把这套仪式换成了菜单栏里的一个图标。

## 菜单栏

状态图标是 DeepSeek 鲸鱼，用模板图像绘制，macOS 会自动为浅色和深色菜单栏着色。服务器状态
一眼可见——运行时是实心的，停止时是变暗的——所有操作都在一处：打开浏览器、重启、停止、
显示面板、打开日志。

状态每 3 秒轮询一次，所以哪怕你是从终端启停的服务器，图标也一直是对的。

## 面板

**显示面板**会打开一个小窗口，操作和菜单里一样，另外还显示 PID 和实际在跑的那条命令。关掉
面板不会退出应用——它仍然待在菜单栏里。缩放和全屏被刻意置灰：这是个固定尺寸的面板，全屏
只会拉出一片空白。

服务器是以 detached 方式启动的，所以退出启动器不会停掉它。停止永远是一个明确的、需要确认的
动作——服务器上可能正跑着会话。

---

真要从一个 GUI 应用里把这件事做对，会碰到几个被终端一直默默盖过去的坑——GUI 应用不继承
shell 的 `PATH`、启动 token 必须跟着进入打开的标签页、停止时必须只针对监听该端口的那个进程。
这些都写在[仓库的 README](https://github.com/songer522/dsh-launcher) 里，连同构建和配置说明。
