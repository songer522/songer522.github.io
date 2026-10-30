---
title: DOSCrate：Mac 上的 DOS 游戏库
summary: 原生 macOS 的 MS-DOS 游戏库与启动器：拖入文件夹、ZIP 或光盘镜像，自动匹配封面与资料，内置 DOSBox Staging 运行时，不用手写一行配置文件。
status: live
tags: ["macOS", "Swift", "SwiftUI", "复古游戏"]
cover: /images/apps/doscrate.png
icon: /images/apps/doscrate-icon.png
links:
  - { label: "下载 DMG (v1.0.0)", url: "https://github.com/songer522/DOSCrateForMac/releases/download/v1.0.0/DOSCrate-1.0.0.dmg" }
  - { label: "GitHub", url: "https://github.com/songer522/DOSCrateForMac" }
featured: true
order: 3
---

DOSCrate 是一个原生的 macOS MS-DOS 游戏库管理器与启动器，用 Swift 6 和 SwiftUI 为 Apple
Silicon Mac 编写。它把对 Finder 友好的 `.doscrate` 游戏包格式和内置的
[DOSBox Staging](https://www.dosbox-staging.org/) 运行时结合在一起——导入、整理、调参、启动
老 DOS 游戏，全程不需要手写 `.conf` 配置文件。

## 为什么做这个

我是在 90 年代玩着 DOS 游戏长大的——人生第一台电脑是一台装了 DOS 和 Windows 3.1 的 486。

今天想重温这些老游戏，DOSBox Staging 是个很好的模拟器，但它不是书架。在 Mac 上玩一堆老 DOS
游戏，通常意味着面对一整个文件夹的八字符缩写目录名、每个游戏各自一份 `.conf`、在 `[autoexec]`
里手敲 `mount c`，以及每次都要回忆到底该运行 `PLAY.BAT`、`GAME.EXE` 还是 `SIERRA.COM`。

我想要的是一个摆着游戏盒封面的架子：点一下 **Play** 就能进游戏，至于年代机型、声卡和光驱挂载，
全都收进右侧检查器的开关里，而不是散落在文本编辑器里。

## 导入与 `.doscrate` 游戏包

把游戏文件夹、`.zip` 压缩包、光盘镜像（`.iso`、`.cue`/`.bin`）或软盘镜像（`.img`、`.ima`）
直接拖进窗口就能导入；也可以选中整个合集目录，把里面的每个子文件夹各自作为一款游戏批量入库。

导入时可以选择拷贝进游戏库（打包成自包含的 `.doscrate` bundle），或者保留在原位置（通过
security-scoped bookmark 引用）。DOSCrate 会自动对目录里的可执行文件打分，挑出主程序和设置
程序（`SETUP.EXE` / `INSTALL.EXE`），接着去 [LaunchBox Games Database](https://gamesdb.launchbox-app.com/)
匹配游戏资料，把包装盒封面、发行年份、开发商和截图一起拉下来。

![按角色扮演类型筛选游戏库](/images/apps/doscrate-filter.png)

*按类型、年份、发行商或开发商筛选游戏库，右侧检查器直接展示封面、截图与游戏简介。*

## 硬件预设，告别手写 `.conf`

每次启动游戏时，DOSCrate 会根据全局默认设置和单游戏的覆盖项，自动生成确定性的 DOSBox Staging
配置：

- **年代预设**：从 **IBM PC XT (1981)** 一路到 **286**、**386**、**486** 和 **Pentium (1995)**，外加 **Auto**。
- **显示与 CPU**：CPU 周期（预设、自动、最大或固定频率）、内存大小（`1`–`64 MB`）、画面比例校正与 CRT 滤镜着色器。
- **音频与输入**：Sound Blaster 型号、Gravis Ultrasound、General MIDI（`.sf2` 音色库）或 Roland MT-32 ROM、鼠标捕获与手柄开关。
- **光盘与软盘**：挂载并调整光盘镜像（`D:`）与软盘镜像（`A:`）顺序，必要时也可以追加自定义的 `[autoexec]` 命令。

![DOS 主题下的全局硬件与模拟器设置](/images/apps/doscrate-settings.png)

*设置窗口里的全局硬件默认值；每款游戏都可以在右侧检查器里单独覆盖。*

## 两套界面主题

默认的 **DOS 主题**直接还原了 16 色 VGA 的味道：`#0000AA` 的蓝底桌面、`#C0C0C0` 的立体斜角
面板、像素图标，以及 VileR 的 `PxPlus IBM VGA 8x16` 点阵字体。如果你更习惯现代的 Mac 界面，
在设置里切一下就能换成原生 macOS 分栏视图与标准控件。

## 底层实现

核心逻辑都放在开启了 Swift 6 严格并发检查的 `DOSCrateKit` 包里，拆成五个模块：`LibraryKit`
（`.doscrate` 读写与 `FSEvents` 目录监听）、`ConfigKit`（硬件预设与 `.conf` 生成）、
`ImportKit`（压缩包/镜像导入与可执行文件识别）、`LauncherKit`（子进程管理与游玩时长统计）
以及 `MetadataKit`（LaunchBox XML 索引与模糊匹配）。

应用通过 Developer ID 签名与公证，打包为适用于 Apple Silicon（macOS 15+）的 DMG，内置未修改的
DOSBox Staging 0.83.0 运行时，并通过 Sparkle 支持应用内更新。
