---
title: Cochleo：听力练习
summary: 为人工耳蜗使用者做的 iOS 听力练习应用：听一个词或短句，从发音相近的选项里选出你听到的那个。全部在设备上运行。
status: live
tags: ["iOS", "无障碍", "SwiftUI"]
cover: /images/apps/cochleo.png
links:
  - { label: "App Store", url: "https://apps.apple.com/us/app/cochleo/id6759081282" }
  - { label: "GitHub", url: "https://github.com/songer522/HearingPractice" }
featured: true
order: 2
---

Cochleo 用 SwiftUI 写成，为人工耳蜗使用者提供听力练习。它读出一个词或一句话，你从几个
发音相近的选项里挑出听到的那个。

## 怎么用

1. 点 **Play Phrase**，应用会念出屏幕上某一个选项。
2. 选出你认为听到的那个。
3. 答对直接进入下一题；答错会弹出反馈页，揭晓正确答案并重放一次。
4. 一轮结束后给出成绩，并存入本机的历史记录。

## 练习内容

- **音素训练**：首辅音、中元音、尾辅音。每轮只取一组对比音（比如全是 /b/ 开头的词），
  让选项之间只差一个音。
- **词汇主题**：食物、动物、迪士尼、颜色与形状、动作词、地点、日常物品、自然与天气。
- **整句练习**：成组的、彼此只有细微差别的句子。

## 可调的难度

选项数量（2–6）、题目数量（10 / 25 / 50）、语速（慢 / 正常 / 快），以及环境——安静，或
叠加背景噪音。噪音模式会在内存里合成一段白噪音并循环播放在语音之下，模拟嘈杂的房间。

## AI 主题包

在支持 Apple Intelligence 的设备上（iOS 26+），输入任意主题，设备端的 Foundation Models
会生成十组四选一的听力题，使用前可以先预览。设置页会显示模型状态：可用、未开启
Apple Intelligence、设备不支持，或正在下载。提示词和生成结果都不离开设备。

## 隐私

不收集、不上传任何数据。成绩历史和偏好设置都存在本机的 `UserDefaults` 里，删除应用即一并
清除。
