# Thai Varso — one-page site

Concept site for Thai Varso, a small Asian gastropub and bar on ul. Chmielna, Warsaw.
Thai curries, Nepalese momo, Indian manchurian, burgers, cocktails and shisha.

Static. No build step — `index.html` plus four images.

## Tests

Run `node --test tests/opening-hours.test.cjs` with Node.js 18 or newer.
The tests execute both pages' status scripts with a controlled clock, including
Warsaw midnight, closing-time and daylight-saving boundaries.

## Design

Polish poster school (Tomaszewski, Świerzy, Cieślewicz): flat field, few spot inks,
condensed poster type. Day runs four inks, night runs two.

- Field `#BFC7B2` · ink `#1E1B16` · chilli `#E8471F` · ticket blue `#2749A8` · mustard `#E0A21C` after 22:00
- Big Shoulders Display / Schibsted Grotesk / Space Mono — all free, full Polish diacritics
- Signature: the hour column on the right edge, one bar per opening hour, current hour filled

`?tryb=dzien` forces the day field, `?tryb=noc` forces night. Otherwise it follows
real Warsaw time.

## Status

Concept/demo. The phone number is a placeholder and the street number is missing.
Menu prices and opening hours were taken from the venue's own published menu.
