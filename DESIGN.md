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

## Why "0 contrast failures" wasn't the same as "actually fine"

A round of user feedback ("colors off, prices almost impossible to read,
different font weight on menu items") landed after the automated contrast
audit had already reported zero failures three commits running. The audit
was correct and also useless for this -- it only proves colour A on colour B
clears a ratio. It says nothing about whether a colour is one of the
documented tokens, whether a price is legible at a glance, or whether two
headings that should match actually do.

Built three more targeted checks instead of trusting the one that had
already missed real bugs:

**Undocumented colour audit.** Walk every rendered text colour on the page,
convert to hex, and diff against the token list in `:root`. Found two:
`#FFC7B4` hardcoded directly in a component instead of declared as a token
(promoted to `--chilli-pale`, documented in the table below), and
`rgba(237,240,230,.8)` -- the *old* steam value from a discarded palette,
sitting in `.figure figcaption` and a dead `.band.night .row` override that
was actively fighting the current `var(--hair)` token with a stale colour
at the wrong alpha. Both replaced with the real token.

**Size-by-role audit.** Walk every text node, classify it as price / caption
/ body by class name, and flag anything under a role-appropriate minimum.
This is what actually found the bug: the catering panel's prices
(`.spec em`) were rendering at **13.8px** while the main menu's prices sat
at **23px** -- the same kind of information, 40% smaller, for no reason
tied to hierarchy. Also caught: the momo/catering-terms price tags
(`.terms i`, 13.4px), the header tagline (11.5px), and the address/info
line at the bottom of the hero (12.8px, riding on a `.mono` base shared by
nothing else, so bumping it broke nothing). Left untouched: the hourhead
category dividers ("Lunch", "Wybór") and table headers ("Zestaw") -- those
are genuinely caption-scale UI, not prices, and passed contrast at their
size.

**Weight-by-role audit.** Walk every heading-class element, group by
selector, and diff computed `font-weight`. Found the buffet band's `h2` at
900 while every other section heading -- `h2.big`, the hero bill items, the
hourhead dividers -- sits at 800. Big Shoulders Display ships both weights
as real instances (not synthesized), so this wasn't a font-loading bug, it
was an undocumented, arbitrary one-off. Aligned to 800; the wordmark stays
at 900 as the one deliberate exception, since a brand mark earning more
weight than body content is a real convention, not an inconsistency.

**The status line was repeating itself.** "Otwarte do 00:00 · open till
00:00" -- and any other close time -- always shows the identical digits
twice in one short line, because a clock reading doesn't need translating
and I was translating everything BUT the number. That reads as a glitch
before anyone parses the surrounding words. Fixed by never showing the same
digits twice: round hours get a real word instead of a number in each
language (`północy` / `midnight`, `12:00` / `noon`), and off-hours get a
locale-appropriate format instead of the same 24h string (`02:00` PL,
`2am` EN). No code path ever prints the same character sequence for both
halves of the line again.

**The header felt squeezed** because `.bill` centred its content vertically
inside the poster (`justify-content:center`) with no minimum top padding --
as the bill's own content grows to nearly fill the viewport (by design, it
targets ~90%), the *remaining* space split top and bottom shrinks toward
nothing, so the gap between the header and the first giant dish name
approached zero exactly when the page was working as intended. Fixed by
giving `.bill` an explicit `padding-top` so a minimum gap is guaranteed
regardless of how tall the content grows, and widening `.poster-top`'s own
padding to match the page's established rhythm. This moved the height
formula's fixed-chrome constant (main: 225px -> 310px; no-promo: -> 290px,
it lacks the top strip) -- re-tuned by testing at five real viewport sizes
and checking for overflow, not by recalculating on paper.

| Token | Hex | Role |
|---|---|---|
| `--chilli-pale` | `#FFC7B4` | Accent text on solid dark fills (`.band.night`, `.buffet`, `.toplink`). Light enough to read on ink at any size, so it doesn't need the small-text contrast checks the darker accent values do. |

## The section-by-section walk (what a script can't see)

After three rounds where every automated check passed and the client still
found real flaws, the fix was not another script. It was screenshotting all
twelve viewport-heights of the page at desktop and three at mobile and
reading them the way a designer reads a proof. Eleven findings, none of
which a contrast or size audit could have flagged:

1. **The "open" dot was red.** Red is stop/closed in every UI convention on
   earth. Now: a filled ink dot means open, a hollow one means closed. And
   the breathing animation no longer fades it to 35% -- on a dark dot that
   reads as *disabled*, the opposite of its job. Floor is 65%.
2. **`25  zł` looked like a double space** inside prose. Space Mono's space
   is a full character cell, so a mono price dropped into proportional text
   gaps like a typo. `word-spacing:-.3em` on every mono price element.
3. **The level meter floated orphaned** below the walk-in line like a broken
   icon. It now sits inline at the end of that sentence as a small glyph.
4. **The momo photo was shorter than its text column**, floating at the top
   with dead space under it. `.split .figure{align-self:stretch}` and the
   image flexes to fill.
5. **Widows.** "piętnastej." alone on a line, "Z / frytkami." split.
   `text-wrap:pretty` on every prose block.
6. **Hourhead labels sat 1300px from their time**, in what is otherwise the
   price column. "Lunch" now sits beside "12–16", in faint ink.
7. **Prices floated above the dish name's baseline.** The eye expects name
   and price on one line. `.tab{display:contents}` at desktop so price and
   swap become direct grid items: price shares row 1 with the `h3` on a
   baseline alignment; swap options sit in row 2, level with the description.
8. English descriptions .833rem -> .9rem.
9. **Six beers with one-word descriptions took six full dish-height rows.**
   `.barrow` rows get tighter padding and the Piwo / Mocktails groups sit in
   a two-column `.bargrid`. Page height 10878px -> 9903px.
10. **`12:00–15:00` broke across lines at the dash** on mobile. `.nowrap`.
11. The `.overflow` audit itself needed fixing: `display:contents` parents
    have no box, so their children "overflowed" a zero-width rect. Skip them.

## Bar & Shisha

Built as real on-page content, not a link out. Curated from the venue's own
live menu system (shisha tiers, 8 cocktails, 6 beers, 4 mocktails) using the
same editorial rule as the food board: representative, not exhaustive. Full
spirits shelf (vodka, whisky, rum, tequila, gin, wines, liqueurs) is named but
not itemised -- a 100-SKU brand list has no place on a one-page poster, and a
printed bar menu routinely says "ask your bartender" for the same reason.

Reuses the `.row` component from the food board rather than inventing a new
one -- bar items get a single description line (ingredient list) instead of
the food board's PL/EN pair, since a cocktail's ingredients don't need
translating the way a dish description does.

## No external links

The page used to link out to the venue's existing menu system
(chmielna.cocolounge.pl) for "see full menu," "bar & shisha menu," and the
allergen list. All three are now internal anchors (`#board`) or removed
outright, now that the page actually contains that content itself. Checked
every occurrence with `grep -n "cocolounge.pl"` before considering this done
-- two were easy to find (the two visible buttons) and one was easy to miss
(the `hasMenu` field in the JSON-LD, which doesn't render but is still a
link out as far as a crawler is concerned).

## The no-promo variant

`no-promo/index.html` is the same page with the buffet strip, buffet band,
and buffet JS removed entirely -- not hidden, removed, so there's no dead
"if buffet exists" branching to maintain. It is a real second page with its
own canonical URL and its own JSON-LD identity, not a duplicate the crawler
has to disambiguate.

It is generated FROM the fixed main file, never edited by hand -- every fix
made to the main page (contact info, the 12:00 alignment, the bar section)
should be re-derived into this file the same way, or the two will drift.
Two things needed re-tuning when the strip was removed, not just deleted:
the image paths (`img/` -> `../img/`, since the file lives one directory
deeper and reuses the parent's photos rather than duplicating ~750KB), and
the poster's height formula (`100svh - 225px` -> `100svh - 175px`), since
removing the top strip freed up real vertical room that the fixed
chrome-height constant didn't know about.

## Preview

`?tryb=dzien` forces the day field, `?tryb=noc` forces night. Without the parameter
the page follows real Warsaw time.
