const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'no-promo/index.html'];
const messages = {
  closed: '<b>Zamknięte · otwieramy o 12:00</b> <u translate="no" lang="en">· opens at noon</u>',
  midnight: '<b>Otwarte do północy</b> <u translate="no" lang="en">· open till midnight</u>',
  two: '<b>Otwarte do 02:00</b> <u translate="no" lang="en">· open till 2am</u>',
};

// Execute the page's actual inline script with the real Warsaw Intl formatter.
// Only the clock, the DOM output sinks and interval scheduling are substituted.
function loadPage(page, instant) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1, 'expected one executable inline script');
  let now = Date.parse(instant);
  function element() {
    const classes = new Set();
    return {
      innerHTML: '', textContent: '', classes,
      classList: { toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); } },
    };
  }
  const dot = element();
  const text = element();
  const buffet = page === 'index.html' ? element() : null;
  const rows = Array.from({ length: 7 }, (_, day) => ({ ...element(), dataset: { d: String(day) } }));
  const timers = [];
  class ClockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  vm.runInNewContext(scripts[0][1], {
    Date: ClockDate,
    Intl,
    document: {
      getElementById(id) { return { dot, liveTxt: text, bufState: buffet }[id] ?? null; },
      querySelectorAll(selector) { assert.equal(selector, '#hoursBody tr'); return rows; },
    },
    setInterval(callback, delay) { assert.equal(delay, 30000); timers.push(callback); },
  }, { filename: page, timeout: 1000 });
  return {
    dot, text, buffet, rows,
    advanceTo(instant) {
      now = Date.parse(instant);
      for (const callback of timers) callback();
    },
  };
}

function check(page, status, day) {
  assert.equal(page.text.innerHTML, messages[status]);
  assert.equal(page.dot.classes.has('shut'), status === 'closed');
  assert.deepEqual(page.rows.filter(row => row.classes.has('today')).map(row => Number(row.dataset.d)), [day]);
}

const cases = [
  ['weekday before midnight', '2026-10-08T23:59:00+02:00', 'midnight', 4],
  ['Friday midnight after Thursday service', '2026-10-09T00:00:00+02:00', 'closed', 5],
  ['Friday before opening', '2026-10-09T11:59:00+02:00', 'closed', 5],
  ['Friday opening', '2026-10-09T12:00:00+02:00', 'two', 5],
  ['Friday before midnight', '2026-10-09T23:59:00+02:00', 'two', 5],
  ['Saturday midnight continues Friday service', '2026-10-10T00:00:00+02:00', 'two', 6],
  ['Saturday just before closing', '2026-10-10T01:59:59+02:00', 'two', 6],
  ['Saturday closes at two', '2026-10-10T02:00:00+02:00', 'closed', 6],
  ['Saturday before opening', '2026-10-10T11:59:00+02:00', 'closed', 6],
  ['Saturday opening', '2026-10-10T12:00:00+02:00', 'two', 6],
  ['Saturday before midnight', '2026-10-10T23:59:00+02:00', 'two', 6],
  ['Sunday midnight continues Saturday service', '2026-10-11T00:00:00+02:00', 'two', 0],
  ['Sunday after midnight', '2026-10-11T01:00:00+02:00', 'two', 0],
  ['Sunday just before closing', '2026-10-11T01:59:59+02:00', 'two', 0],
  ['Sunday closes at two', '2026-10-11T02:00:00+02:00', 'closed', 0],
  ['Sunday before opening', '2026-10-11T11:59:00+02:00', 'closed', 0],
  ['Sunday opening starts midnight-closing service', '2026-10-11T12:00:00+02:00', 'midnight', 0],
  ['Sunday before midnight', '2026-10-11T23:59:00+02:00', 'midnight', 0],
  ['Monday midnight after Sunday service', '2026-10-12T00:00:00+02:00', 'closed', 1],
  ['Monday opening', '2026-10-12T12:00:00+02:00', 'midnight', 1],
  ['winter Sunday after midnight', '2026-01-04T01:00:00+01:00', 'two', 0],
  ['summer Sunday after midnight', '2026-07-05T01:00:00+02:00', 'two', 0],
  ['before spring clock jump', '2026-03-29T01:59:00+01:00', 'two', 0],
  ['after spring clock jump', '2026-03-29T03:00:00+02:00', 'closed', 0],
  ['before autumn closing', '2026-10-25T01:59:00+02:00', 'two', 0],
  ['first autumn two oclock', '2026-10-25T02:00:00+02:00', 'closed', 0],
  ['repeated autumn two oclock', '2026-10-25T02:00:00+01:00', 'closed', 0],
];

for (const page of pages) {
  for (const [name, instant, status, day] of cases) {
    test(`${page}: ${name}`, () => check(loadPage(page, instant), status, day));
  }

  test(`${page}: interval refresh crosses midnight, closing and reopening`, () => {
    const loaded = loadPage(page, '2026-10-10T23:59:00+02:00');
    check(loaded, 'two', 6);
    loaded.advanceTo('2026-10-11T00:00:00+02:00');
    check(loaded, 'two', 0);
    loaded.advanceTo('2026-10-11T02:00:00+02:00');
    check(loaded, 'closed', 0);
    loaded.advanceTo('2026-10-11T12:00:00+02:00');
    check(loaded, 'midnight', 0);
  });
}

test('main page keeps the buffet countdown independent of the closing label', () => {
  const page = loadPage('index.html', '2026-10-11T14:59:00+02:00');
  check(page, 'midnight', 0);
  assert.equal(page.buffet.textContent, 'Trwa teraz · jeszcze 1 min');
  page.advanceTo('2026-10-11T15:00:00+02:00');
  assert.equal(page.buffet.textContent, 'Jutro od 12:00');
  check(page, 'midnight', 0);
});
