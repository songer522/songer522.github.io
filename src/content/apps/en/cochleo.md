---
title: Cochleo
summary: An iOS listening-practice app for cochlear implant users — it speaks a word or phrase, and you pick what you heard from sound-alike options. Everything runs on-device.
status: live
tags: ["iOS", "Accessibility", "SwiftUI"]
cover: /images/apps/cochleo.png
links:
  - { label: "App Store", url: "https://apps.apple.com/us/app/cochleo/id6759081282" }
  - { label: "GitHub", url: "https://github.com/songer522/HearingPractice" }
featured: true
order: 2
---

Cochleo is a SwiftUI listening-practice app for cochlear implant users. It speaks a word
or a phrase out loud, and you pick what you heard from a set of sound-alike choices.

## How it works

1. Tap **Play Phrase** — the app speaks one of the options on screen.
2. Tap the one you think you heard.
3. A correct answer advances immediately; a wrong one opens a feedback sheet that reveals
   and replays the right answer.
4. At the end of the quiz you get a score, saved to your local history.

## What you can practise

- **Phoneme drills** — initial consonants, medial vowels, final consonants. Each quiz picks
  a single contrast group (all /b/ words, say), so the options differ by one sound.
- **Vocabulary sets** — food, animals, Disney, colours and shapes, action words, places,
  everyday objects, nature and weather.
- **Phrases** — full sentences grouped into minimally different alternatives.

## Difficulty controls

Number of options (2–6), number of questions (10 / 25 / 50), speech speed (slow, normal,
fast), and environment — quiet, or with background noise. Noise mode synthesises white
noise in memory and loops it under the speech to simulate a noisy room.

## AI topic packs

On Apple Intelligence–capable devices (iOS 26+), type any topic and the on-device
Foundation Models framework generates ten four-option listening sets about it, previewed
before use. The settings screen reports model availability — ready, Apple Intelligence
off, device not eligible, or still downloading. No prompt or response leaves the device.

## Privacy

Nothing is collected or transmitted. Quiz history and preferences live in `UserDefaults`
on the device and go away when the app is deleted.
