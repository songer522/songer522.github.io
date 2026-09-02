---
title: "Rewind: Memories on This Day"
summary: An iOS app that resurfaces the photos and videos you took on this day in past years, grouped by year — entirely on-device, nothing uploaded.
status: live
tags: ["iOS", "Photo memories", "Indie"]
cover: /images/apps/rewind.png
links:
  - { label: "App Store", url: "https://apps.apple.com/us/app/id1137168287" }
  - { label: "GitHub", url: "https://github.com/songer522/PhotoFlashBack" }
featured: true
order: 1
---

Rewind scans your whole photo library for anything shot on today's day and month, and
groups it by year — this day in 2015, this day in 2014, and back.

## Why I built it

The engineers at Apple and Google are too lazy.

Rewind does one thing: it lists everything in your library shot on this day and month,
in full, grouped by year.

## Features

- **On this day, every year** — matches today's day and month across the entire library and groups the results by year.
- **Any date** — a date picker jumps to any other day of the year.
- **Media filters** — show or hide photos, videos, and screenshots independently; the choice persists between launches.
- **Two layouts** — a uniform grid and a mosaic compositional layout, switched from the overflow menu.
- **Full-screen viewer** — paged browsing with a custom zoom transition, video playback, capture time, reverse-geocoded place names (cached to avoid repeat lookups), and share or delete without leaving the viewer.
- **Home screen widget** — a WidgetKit extension showing today's memories, refreshed at midnight.
- **Background refresh** — a `BGTaskScheduler` job warms the day's memories so the app and widget open with content ready.

## How it's built

The app is Swift and UIKit; the widget is a SwiftUI WidgetKit extension, and the two
share data through an App Group. Everything reads directly from the on-device
`PHPhotoLibrary` — there is no backend, and nothing is uploaded.
