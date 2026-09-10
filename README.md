# Translational Neurosurgery Laboratory — website

Static site for the Broggini / Czabanka lab, Klinik für Neurochirurgie,
Universitätsklinikum Frankfurt.

No build step, no dependencies. Plain HTML, CSS and vanilla JavaScript, so it can
be dropped straight onto GitHub Pages (or any web host) as-is.

## Run it locally

**Easiest:** double-click **`start-website.cmd`**. It starts the server and opens
your browser. Close the black window when you are finished.

**From PowerShell** — note that PowerShell does *not* accept `&&` as a separator,
so run the two commands on separate lines:

```powershell
cd "P:\Work\Website\lab-website"
python -m http.server 8777
```

Then open <http://127.0.0.1:8777/>.

## Pages

The site follows the section structure of the previous Hugo site — one page per
area rather than a single long scroll.

| File | Nav label | Contents |
|---|---|---|
| `index.html` | Home | Hero, mission, research preview, featured paper, PI, contact + map |
| `research.html` | Research | The four research lines, in depth, + equipment |
| `publications.html` | Publications | All 29 PubMed records, filterable by theme |
| `team.html` | Team | PI, current members, **alumni** |
| `gallery.html` | Gallery | The group · At the bench · Conferences |
| `activities.html` | Activities | **Group activities**, one section per event |
| — | Contact | `index.html#contact` |

**The `<header class="nav">` and `<footer>` blocks are duplicated in all six
pages.** There is no template engine — if you change a nav link, change it in all
six files (each is marked with a comment).

## Structure

```
index.html  research.html  publications.html  team.html  gallery.html  activities.html
start-website.cmd              double-click to preview locally
assets/css/style.css           design tokens, layout, light + dark themes
assets/js/publications.js      GENERATED — 29 publications from PubMed
assets/js/main.js              nav, scroll reveals, counters, filters, lightbox
assets/img/team/               portraits
assets/img/science/            imaging + lab photographs
assets/img/life/               group photographs
assets/img/activities/         group activities (team building)
assets/img/conferences/        conference photographs
assets/img/press/              Neuron cover
```

## Team roster on the site

**Current** — Thomas Broggini (PI), Weiji Jia (Postdoctoral Researcher),
Adrian Rombach (Clinical Scientist), Dr. med. Maximilian Geißler (Clinical
Scientist), Carolin Weißmann (Technical Assistant / MTA).

**Alumni** — Ida Kulacz (Doctoral Researcher), Philipp Wack (Doctoral
Researcher), Xiao Liu (MD Student).

Portrait sources:

- 2024 studio session — Rombach, Weißmann, Kulacz, Wack
- cropped from the 2024 group photo `IMG_5082.jpeg` — **Weiji Jia**, **Xiao Liu**,
  **Maximilian Geißler** (own material, so no third-party licence question)
- clinic website — **Thomas Broggini** only, saved as
  `broggini-thomas-klinik.jpg`
  (`unimedizin-ffm.de/fileadmin/_processed_/7/6/csm_Broggini_Thomas_*.jpg`)

**A note on caching.** When you replace an image, browsers keep showing the old
one until the cache expires. Give the new file a *different name* and update the
`<img src="...">` — that is why the PI portrait is `broggini-thomas-klinik.jpg`
rather than overwriting `broggini-thomas.jpg`. Otherwise, `Ctrl`+`F5` forces a
reload for you but not for your visitors.

## Where the content came from

| Section | Source |
|---|---|
| Lab mission, approach | `P:\Work\Website\Welcome to the Translational Neurosurgery Laboratory….docx` |
| Research programme | the same file + `Expression of interest…Molekulare and Translationale Medicine.docx` |
| Address | the clinic's own page (`unimedizin-ffm.de` → Experimentelle Neurochirurgie / Labor) |
| Rombach + Geißler titles | `unimedizin-ffm.de` → Klinik für Neurochirurgie → Team → Ärztinnen und Ärzte |
| Featured "washing machine for the brain" | `P:\Work\Presse\240829_147-Vasomotion_EN.docx` (Goethe University press release, 31 July 2024) |
| Neuron cover image | `P:\Work\Presse\NEURON_112_14_4C.pdf` |
| PI career timeline | `P:\Work\Presse\3_IBT_Berufsportraet_Broggini_….pdf` (ZHAW) + `Medical Neuroscience Ambassador .docx` |
| Publications | PubMed, query `Broggini T[Author]` — all 29 indexed records |
| Portraits | `P:\Work\Pictures Labmembers\2024\` (2024 studio session) |
| Lab / science photos | `P:\Work\Pictures Labmembers\2025\` (2025 photo session) |
| Group photos | 2024 + 2025 sets, `P:\My Pictures\Bloodfest VT\` |
| Group activities | `P:\Work\Teambuilding\` — Bowling, Goethe Lauf 2025, Lasertag, Standup Paddeling |
| Conferences | `P:\My Pictures\Bloodfest VT\` — Blood Fest 2024, University of Vermont |
| Hero figure | `P:\Work\Website\AIM_Berkeley_2021 _corrected-variant.png` |
| Logo | `P:\LabRescources\Illustrations\LabLogo\Lab Logo v2.svg` |
| Equipment list | `P:\LabRescources\Documentation\Equipment-Manuals\` — read from the manuals |

## ⚠ Check before publishing

Search the HTML for `TODO`:

1. **Weiji Jia, Xiao Liu and Maximilian Geißler are cropped from the 2024 group
   photo**, so they are softer than the studio portraits. Replace them with studio
   shots when you have them.
2. **Group activity captions** — dates come from the file timestamps
   (Lasertag Jan 2025, Bowling Mar 2025, SUP Aug 2025, Goethe-Lauf / dragon boat
   Sept 2025). The one-line descriptions are editorial; rewrite freely.
3. **Hero statistics** — "3 imaging modalities" and "2 continents, one lab" are
   editorial. Publications (29) and lead-authored (12) come from PubMed.
4. The 2025 group photo has been white-balanced (the original had a strong blue
   cast). The original on disk is untouched.
5. **The equipment list** on `research.html` was compiled from the manuals in
   `Equipment-Manuals`. Model names came from the manual cover pages; the FACS
   manual carries no model name, so it is listed generically. Check it against
   what is actually in the room before publishing.
6. **Conference photographs** are all from Blood Fest 2024 (University of
   Vermont) — the only conference set on the drive. `P:\Work\Meetings\` holds
   only a PDF. Add more sets to `assets/img/conferences/` as you collect them.

## Refreshing the publication list

`assets/js/publications.js` is generated. To update it, re-run a PubMed query for
`Broggini T[Author]` and rewrite the file — each entry is:

```js
{ pmid, doi, year, title, journal, authors: [...], tags: [...], featured, lead }
```

`tags` drives the filter buttons; `featured: true` adds the ★ Selected marker.

## Notes

- **The location map on the home page loads only when the visitor clicks it.**
  Embedding Google Maps directly would contact Google and set cookies on every
  page view, which a German university site should not do without asking. The
  "Get directions" button next to it is a plain link and contacts nobody until
  it is followed. To change the pin, edit `data-query` on `<div class="map">`
  in `index.html`.
- Light and dark themes both ship; the toggle is in the nav (top right) and the
  choice is remembered in `localStorage`. The first visit follows the OS setting.
  Both the hero and the sub-page headers change with the theme, and the button
  shows where the click will take you — moon in light mode, sun in dark mode.
- All animation is disabled under `prefers-reduced-motion`.
- Fonts (Inter, Source Serif 4) load from Google Fonts. To make the site fully
  self-contained, download them into `assets/fonts/` and swap the `<link>` in
  each page for an `@font-face` block.
