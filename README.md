# Luiza Demianchuk — Portfolio

Astro 7 + GSAP 3 portfolio. Vanilla JS, no UI framework, no CSS framework.

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static output in ./dist
npm run preview
```

## Structure

```text
src/
├── content.config.js        # "projects" collection schema (Content Layer + zod)
├── content/projects/*.md    # one Markdown file per project
├── assets/                  # images, optimised by astro:assets
│   ├── portrait.svg
│   ├── logo-home.png        # image above the name in the intro
│   ├── fonts/steps-mono-ua/ # self-hosted title font
│   ├── software/            # optional real software icons (<id>.svg)
│   └── projects/<slug>/     # cover + gallery images per project
├── data/
│   ├── site.js              # name, bio, CV links, socials, email
│   ├── categories.js        # project filter categories (#GraphicDesign …)
│   └── software.js          # software icons on project pages (Ps, Ai …)
├── layouts/BaseLayout.astro # <head>, fonts, <ClientRouter />, overlay, cursor
├── components/              # Intro, ProjectsSection, ProjectCard, RetypeText, ScrollCue,
│                            # SoftwareIcon, SiteFooter, TransitionOverlay, Cursor
├── pages/
│   ├── index.astro          # home
│   └── projects/[id].astro  # project detail (info column + scrolling gallery)
├── scripts/
│   ├── main.js              # wires everything into Astro's page lifecycle
│   ├── gsap.js              # plugin registration (ScrollTrigger, Flip)
│   ├── transitions.js       # page transitions on top of Astro's ClientRouter
│   ├── animations.js        # data-animate="…" entrance + scroll animations
│   ├── retype.js            # Ukrainian → English retyping text effect
│   ├── project-filter.js    # category filter (GSAP Flip)
│   ├── gallery-scroll.js    # "Scroll ↓" cue under the project gallery
│   ├── embeds.js            # click-to-load 3D embeds (Sketchfab)
│   ├── liquid-grid.js       # faint wavy grid behind every page
│   └── cursor.js            # inverting circle cursor
└── styles/global.css        # cascade layers, tokens, base styles
public/
├── files/                   # CV / portfolio PDFs
└── projects/<slug>/         # videos (Astro doesn't process video)
```

## Editing content

- **Your details** → `src/data/site.js` (bio, email, social links).
- **CV / portfolio PDFs** → put `cv-en.pdf`, `cv-nl.pdf` and `portfolio.pdf` in `public/files/`.
- **Portrait** → replace `src/assets/portrait.svg` (any jpg/png/webp works; update the import in `Intro.astro`).
- **Image above the name** → `src/assets/logo-home.png`.
- **New project** → add `src/content/projects/my-project.md` and its images in `src/assets/projects/my-project/`:

```md
---
title: My Project
titleNative: Мій проєкт               # the heading retypes from this into the title
year: 2026                            # or text for ongoing work: '2021+'
order: 5                              # position in the grid
categories: [graphic]                 # graphic | branding | web | gamedev — see src/data/categories.js
software: [photoshop, illustrator]    # see src/data/software.js (can be [])
summary: One line used for SEO and the meta description.
cover: ../../assets/projects/my-project/cover.jpg
coverAlt: Describe the cover image
gallery:
  - src: ../../assets/projects/my-project/01.jpg
    alt: Describe the image
  # A video (file in public/projects/my-project/):
  - video: /projects/my-project/clip.mp4
    poster: ../../assets/projects/my-project/clip-poster.jpg
    alt: Describe the video
  # A 3D model (loads when clicked):
  - embed: https://sketchfab.com/models/<id>/embed
    link: https://sketchfab.com/3d-models/<id>
    poster: ../../assets/projects/my-project/model.jpg
    alt: Describe the model
---

Project description in Markdown.
```

**Filter categories** live in `src/data/categories.js`. Every project needs at least one; categories
without any projects are hidden from the filter automatically.

**Software icons** — the list is in `src/data/software.js`. Each shows a square with its abbreviation
(Ps, Ai, …) until you add a real icon: save it as `src/assets/software/<id>.svg` (e.g. `photoshop.svg`)
and it's used automatically.

## Animations

Add `data-animate` to any element:

| value      | effect                                     |
| ---------- | ------------------------------------------ |
| `fade-up`  | fade + rise                                |
| `stagger`  | children fade in one after another         |
| `rule`     | line draws from the left                   |
| `clip`     | image wipes up while scaling down          |
| `cards`    | grid items rise in sequence, row by row    |
| `reveal`   | gallery image/video wipes down on scroll   |
| `pixels`   | wrapped `<img>` appears block by block     |

**Retyping headings** — use the component instead of a plain heading:

```astro
<RetypeText as="h2" text="Projects" from="Проєкти" />
```

It types from `from` to `text` letter by letter, with a few flickering glyphs running ahead.
Screen readers and no-JS visitors only get the English `text`. Tune `flicker` / `speed` in `src/scripts/retype.js`.

Elements above the fold play after the page transition; the rest play on scroll.
Everything is reverted before each page swap, and nothing animates when the visitor has
`prefers-reduced-motion` turned on. Without JavaScript, all content is visible.

Page transitions: `data-transition-title="…"` on a link sets the text shown on the overlay
while the next page loads.

## Fonts

Loaded through Astro's built-in Fonts API (`astro.config.mjs`) and self-hosted:

- **Steps Mono UA** (titles) — local files in `src/assets/fonts/steps-mono-ua/` (SIL OFL 1.1, Latin by Velvetyne, Ukrainian by LevType)
- **Inter** (body) and **JetBrains Mono** (labels/buttons) — downloaded from Fontsource at build time
