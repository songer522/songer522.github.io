---
title: Track Lapse
summary: The first iOS game I worked on, built in cocos2d at my first job in 2012. I'm currently bringing it back to life.
status: wip
tags: ["iOS", "Game", "cocos2d"]
cover: /images/apps/track-lapse.png
links:
  - { label: "GitHub", url: "https://github.com/songer522/Clay" }
featured: true
order: 3
---

A side-scrolling runner: race through themed levels, dodging and kicking obstacles, chasing
the clock for bronze, silver and gold medals.

## Some background

This was the first iOS game I worked on, in 2012, at my first job. The company no longer
exists, and the game came off the App Store long ago — there is nowhere to download it now.

The Xcode project and sources still carry its original code name, **Clay**; the name it
shipped under was **Track Lapse**.

## The game

Eight themed levels — Track Run, Barn Run, Town Run, Disco Run, City Run, Undead Run,
Computer Run, Volcano Run. Obstacles chain into each other: kick a hen into a cow, set
rolling hay going, or a line of zombies. Comic-panel cutscenes sit between levels, and the
later ones end in boss fights.

![The Disco Run level](/images/apps/track-lapse-disco.png)

![The Computer Run level](/images/apps/track-lapse-computer.png)

![The Undead Run level](/images/apps/track-lapse-undead.png)

*Screenshots from the original App Store listing.*

## Where it stands

The code is Objective-C on cocos2d-iphone, with every third-party library vendored in-tree.
It builds and runs against a current iOS SDK today, but the layout is still the original
frame-based one, designed only for 3.5-inch and 9.7-inch screen proportions — so it does not
lay out correctly on a modern device yet. That is the part I'm working on.

Whether it ever goes back on the App Store is an open question. For now it lives on GitHub.
