# Thai Varso — design system

Small Asian gastropub and bar, ul. Chmielna, Warsaw. Thai curries, Nepalese momo,
Indian manchurian, burgers, cocktails, shisha. 22–51 zł. Open 12:00 to midnight,
to 02:00 Friday and Saturday.

**The one thing to remember:** Warsaw's Asian corner till 2am.

---

## Where the look comes from

The **Polish poster school** — Tomaszewski, Świerzy, Cieślewicz. Warsaw's genuine
world-class contribution to graphic design, made on bad paper with three or four
spot inks because that's all the state presses could give them. Loud, sour-coloured,
unprecious.

That choice solves the brief's actual constraint. The place charges 22–51 zł for a
curry and must not look like it charges 90. A screen-printed poster is structurally
incapable of looking expensive, and it still looks good.

**The mark: the tower is a steamer.** A stack of bamboo baskets has the same
silhouette as Varso Tower. The name is already a Thai/Warszawa pun; the mark gives
it a second floor. Three stacked baskets, three steam wisps, drawn in one weight.

The binding material is **steam** — off the momo, off the pho, off the shisha, off
your breath on Chmielna in November. The one substance shared by a Nepalese
dumpling and a Warsaw side street.

## Colour — two plates on a lilac stock

Purple is the client's call. It is done as a **flat field**, never a gradient.

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#E7E0EF` | The field. Soft lilac stock — purple as a tint, not a flood. |
| `--ink` | `#1B1526` | Plate 1. All type and rules. Violet-cast black, 10.8:1 on the field. |
| `--chilli` | `#8E2410` | Plate 2 as **text** — accents on lilac, 5.3:1. |
| `--chilli-fill` | `#B02D12` | Plate 2 as a **fill** — bands, with `--steam` type at 5.74:1. |
| `--chilli-bright` | `#E2401C` | Plate 2 at full strength. Display sizes and the photo midtone only. |
| `--steam` | `#F4EFF8` | Type on plate-2 fills, and inset panels. |
| `--night` | `#3B2357` | The field after 22:00. Deep grape, 11.9:1 with `--steam`. |

**What was wrong before.** The first build ran sage green + orange-red + ballpoint
blue + mustard: **four competing hues**, and a desaturated green against a bright
orange goes muddy. Good poster palettes are two plates on a stock. The blue was the
error — prices are now ink.

Purple and vermilion are near-complementary, which is why the bands sing against the
field instead of fighting it. Day is light lilac and night is deep grape: same hue
family, so the page never turns into the generic dark site.

Roles, not raw colours, are what components reference:

```css
--accent: var(--chilli);  --price: var(--ink);                    /* day   */
body.late { --accent: var(--steam); --price: var(--steam); }      /* night */
```

Never reference `--chilli*` or `--ink` directly in a component, or the night state
breaks.

## Text colour is declared per SURFACE, never per element

This is the rule that matters most, because breaking it produced invisible text
on the live site.

```css
:root      { --on:#1B1526; --on-mute:…; --on-faint:…; --hair:…; --accent:#8E2410 }
body.late  { --on:#F4EFF8; … }                    /* the deep-grape page */
.band.steam, .spec, .cta, .tl-state { --on:#1B1526; … }   /* light islands  */
.band.night, .buffet, .toplink      { --on:#F4EFF8; … }   /* printed solid  */
```

Components only ever use `var(--on)`, `var(--on-mute)`, `var(--on-faint)`,
`var(--hair)`, `var(--accent)`, `var(--price)`. They never write a colour.

**What went wrong before.** Text colours were hardcoded per element, and night mode
flipped `color` on `body`. The light paper panels — the momo band, the catering spec
— kept their light background and inherited light text. An audit of every text node
against its *resolved* background found **26 failures by day and 31 at night, many at
ratio 1.00**: text exactly the colour of the surface behind it. Invisible.

With surface tokens, a light panel dropped into a dark page re-declares its own ink
and stays readable. The bug class cannot recur.

**Check it before shipping.** Walk every text node, resolve the background up the
tree through transparency, and compare against 4.5:1 (3:1 for large or bold text).
Do not eyeball it — two of these were invisible and neither was noticed by reading
the page. Current state: **0 failures in both modes.**

## Proportion

Type and spacing run on a **phi (1.618) modular scale**, not hand-picked values:

```css
--t--1:.833rem; --t-0:1rem; --t-1:1.2rem; --t-2:1.44rem;
--t-3:1.728rem; --t-4:2.618rem; --t-5:4.236rem;
--s-1:8px; --s-2:13px; --s-3:21px; --s-4:34px; --s-5:55px; --s-6:89px;
```

The spacing steps are the Fibonacci series at an 8px root, which converges on phi.
New components pick a step; they do not invent a number.

## Buttons

Not filled rectangles — that is the Material default and it has nothing to do with
this page. A button is a block with its **second plate landed off-register**: a hard
6px offset shadow in `--chilli-bright`, no blur, no radius. On hover the plates snap
into register (`steps(2)` timing, so it jumps rather than glides). It is the one
artifact every screen print has.

## Type

All three are free with full Polish diacritics. No licence to buy.

| Role | Face | Why |
|---|---|---|
| Display | **Big Shoulders Display** 700–900 | Ultra-condensed, industrial, drawn to be set enormous. At poster scale the letters become tall narrow columns — the steamer stack and the tower. |
| Body | **Schibsted Grotesk** 400–700 | A grotesque with visible personality. Casual and human at 16px, never signals luxury. |
| Data | **Space Mono** 400/700 | Every price, hour, head count. Reads like a till receipt — the right register for a 22–51 zł place. |

The name is set small and never grows. The food is enormous. That inversion is the
posture: nobody comes for the logo.

## Layout

**First viewport is a poster, not a document.** Flat field, no photograph, no hero
image, no centring. Display size is computed from *both* axes so the longest word
always clears the price column and eight lines always fit the screen:

```css
font-size: clamp(1.75rem,
  min(calc((100vw - var(--gut)*2 - 110px) / 4.7),
      calc((100svh - 225px) * .132)),
  7rem);
```

Then: **buffet band** on chilli → **steam band** (the momo, screen-printed) → **the
board**, grouped by hour not by course → **night band** on ink → **catering** as a
spec sheet, because office managers want a number not lifestyle copy → **footer**.

## The signature — the bill

The first viewport: eight dishes at 40–112px, flush left, prices tucked right on a
leader rule. A bill at billboard scale. It needs no explanation, which is the test
it has to pass.

**Killed:** an earlier version ran a fixed column of opening hours down the right
edge — one bar per hour, current hour filled. Clever, and nobody understood it. Two
readers in a row asked what the numbers were. A signature that needs a caption has
failed, and it was competing with the bill for the same job. The hours are now
stated in words in the header: *Otwarte do 02:00 · open till 02:00*.

Keep one loud thing. The bill is it.

## Type rules that are not negotiable

**Headings never go below `line-height: 1.12`.** In Big Shoulders Display, accented
capitals (`MĘŻĄŚÓŹĆŃ`) span **1.15em of ink** — 0.98em above the baseline for the
acute and dot, 0.17em below for the ogonek. An earlier build set 0.94, which is
tighter than the glyphs themselves, so lines physically overlapped on every Polish
heading. Measure with `canvas.measureText().actualBoundingBoxAscent/Descent` before
touching this.

The poster bill is the one exception, at 0.92 — those eight words carry no
diacritics. Add a dish with an ogonek to that list and the value has to go up.

**Mono is for numbers.** Space Mono covers prices, times and head counts. Labels,
eyebrows, captions and menu prose are Schibsted Grotesk. An earlier build set every
label in spaced uppercase mono and read robotic.

## Menu rows

Name, Polish, English, then the price on its own line at the bottom. The dish name
and the price were previously on one line, right-aligned against each other, and
competed for the same attention. English sits at 0.86rem and 52% ink — present for
anyone who needs it, never fighting the Polish.

## The buffet band

All-you-can-eat fried rice, every day 11:00–15:00, 25 zł. Chilli field, ink type,
full bleed, directly under the poster. It is the strongest commercial offer on the
page and it is not buried in the menu.

It carries a four-bar level meter running at **128 BPM** (`.469s` per beat, stepped
timing so it reads printed rather than smooth). An animated meter reads as *music
playing* to anyone. An earlier version also printed the number `128` — nobody knew
what it meant, so it went. Same failure as the hour column: encoding is not
communicating.

**Persuasion, and the line.** The band uses real levers only: the offer sits above
everything else on the page; the window state comes from the actual clock (*Trwa
teraz · jeszcze 2 h 14 min*, *Jutro od 11:00*); friction is named away (*bez
rezerwacji*); and the anchor is the venue's **own à la carte price — 33 zł a plate
against 25 zł unlimited**, which is true and checkable.

No fabricated scarcity, no fake countdowns on a permanent offer, no invented social
proof. On a neighbourhood bar those get spotted, and the cost is trust with the
regulars the place actually runs on.

## Photography

Every photo is printed as a **tritone** — ink in the shadows, chilli in the
midtones, steam in the highlights, with light grain. Reason: the source photography
is dark and moody and would fight a pale green field. The treatment also keeps the
images honest as a graphic device rather than a literal claim about the plate.

Recipe in `tools/tritone.py`. Shadows `#1E1B16` → mid `#E8471F` at 55% → highlight
`#EDF0E6`, contrast ×1.25, grain ±7.

## Rules

1. Chilli is a fill, never small text. Use `--chilli-deep` for red type.
2. Components reference `--accent` and `--price`, never `--ticket`/`--chilli`
   directly — otherwise the night state breaks.
3. The name stays small. The food stays enormous.
4. Menus group by hour, not by course.
5. No stock photography. Only the venue's own, tritoned.
6. Say the venue honestly: a small bar with a few tables outside, loud some nights.
   Never imply more room, more polish or more service than exists.
7. Kill the old tagline. "Fusion cuisine | Shisha & Bar" is the most dated phrase
   available to a restaurant in 2026. It's now: *Momo, curry, ramen. Chmielna. Do
   drugiej.*

## Preview

`?tryb=dzien` forces the day field, `?tryb=noc` forces night. Without the parameter
the page follows real Warsaw time.
