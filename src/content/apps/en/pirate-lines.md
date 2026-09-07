---
title: Pirate Lines
summary: Pirate dots and boxes, shipped for iOS in 2012 — the first game I built entirely on my own. Now dusted off, and playable in your browser.
status: live
tags: ["iOS", "Game", "cocos2d"]
cover: /images/apps/pirate-lines.png
playUrl: https://songer522.github.io/Grid/
links:
  - { label: "Play in browser", url: "https://songer522.github.io/Grid/" }
  - { label: "GitHub", url: "https://github.com/songer522/Grid" }
featured: true
order: 3
---

Dots and boxes, but with pirates. You and your opponent take turns drawing one line between
two dots; close the fourth side of a box and it's yours, and you get to go again. Chart fills
up, higher score wins. That's the whole game — and then you spend the next hour trying to
beat the CPU.

There are 96 levels, and none of them is a plain square grid. The routes wander around
treasure chests, ships and storms, so half the puzzle is just the shape of the board.

## My first solo game, and I have no idea how

[Track Lapse](/en/apps/track-lapse/) was at my first job, with a whole team around me.
Pirate Lines, later in 2012, was the first one where the code was all mine.

And apparently past me was not messing around. There's a CPU opponent that genuinely plays —
it reads the board, refuses to hand you a chain, and takes everything it can get. There's
Bluetooth multiplayer, two phones finding each other with no internet anywhere. There's
online multiplayer through Game Center, with matchmaking and invites. Leaderboards. In-app
purchases. Ninety-six levels.

I'd think twice about all of that today, with a decade more experience. Twenty-something me
just went ahead and built it, presumably because nobody told him it was a lot.

## The art is not mine

Every pixel you see — the pirates, the ships, the treasure chests, the storm clouds, that
logo — is the work of **Tianyu**, and he designed a good number of the levels too. The game
looks the way it does entirely because of him.

Thank you, 天宇哥. Fourteen years later it still holds up.

## Go play it

There's a web version. No install, no App Store, just click:

**[songer522.github.io/Grid](https://songer522.github.io/Grid/)**

It shares no code with the iOS version, but it reuses the original art and all 96 maps, so
it's the same board you'd get on a phone. The CPU came along too, still annoyingly good.
Multiplayer and Game Center didn't make the trip.

## Getting it running again

The project sat untouched for over a decade, which in iOS years is roughly forever. It didn't
compile, and half the APIs it loved had been quietly deleted by Apple. The layout was also
convinced every phone is 320×480, which stopped being true around 2014.

It builds and runs today, on iPhone and iPad. The code is
[on GitHub](https://github.com/songer522/Grid), 2012 vintage, aged in oak.
