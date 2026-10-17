"""Run offline with: python -m unittest discover -s tests -v."""

from html.parser import HTMLParser
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.elements = []
        self.text_elements = []
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        element = {'tag': tag, 'attrs': dict(attrs), 'text': ''}
        self.elements.append(element)
        if tag in ('a', 'h3'):
            self.text_elements.append(element)

    def handle_data(self, text):
        for element in self.text_elements:
            element['text'] += text

    def handle_endtag(self, tag):
        self.text_elements = [element for element in self.text_elements if element['tag'] != tag]


class NavigationTests(unittest.TestCase):
    def check_burger_destination(self, page):
        elements = Page(ROOT / page).elements
        links = [element for element in elements
                 if element['tag'] == 'a'
                 and 'line' in element['attrs'].get('class', '').split()
                 and element['text'].strip().startswith('Burger')]
        self.assertEqual(len(links), 1, 'Expected one Burger link in the hero menu')
        href = links[0]['attrs']['href']
        self.assertTrue(href.startswith('#'))
        targets = [i for i, element in enumerate(elements) if element['attrs'].get('id') == href[1:]]
        self.assertEqual(len(targets), 1, 'Burger must resolve to one on-page target')
        following = elements[targets[0]:]
        first_heading = next(element['text'] for element in following if element['tag'] == 'h3')
        self.assertEqual(first_heading, "Chef's Special Burger", 'Burger should open the burger menu, not the bar/shisha section')

    def test_main_burger_link_opens_the_burger_menu(self):
        self.check_burger_destination('index.html')

    def test_no_promo_burger_link_opens_the_burger_menu(self):
        self.check_burger_destination('no-promo/index.html')

    def test_local_links_resolve_to_unique_targets_on_both_pages(self):
        for page in ('index.html', 'no-promo/index.html'):
            with self.subTest(page=page):
                elements = Page(ROOT / page).elements
                ids = [element['attrs']['id'] for element in elements if 'id' in element['attrs']]
                for element in elements:
                    href = element['attrs'].get('href', '')
                    if element['tag'] == 'a' and href.startswith('#'):
                        self.assertEqual(ids.count(href[1:]), 1, href)


if __name__ == '__main__':
    unittest.main()
