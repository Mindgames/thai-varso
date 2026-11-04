"""Run offline with: python -m unittest discover -s tests -v."""

from html.parser import HTMLParser
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class Metadata(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.values = {}
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        if tag == "meta":
            attrs = dict(attrs)
            key = attrs.get("property") or attrs.get("name")
            self.values.setdefault(key, []).append(attrs.get("content", ""))


class DescriptionTests(unittest.TestCase):
    def test_no_promo_descriptions_exclude_the_buffet_offer(self):
        metadata = Metadata(ROOT / "no-promo/index.html").values
        for key in ("description", "og:description"):
            with self.subTest(metadata=key):
                self.assertEqual(len(metadata.get(key, [])), 1)
                self.assertTrue(metadata[key][0].strip())
                self.assertNotRegex(metadata[key][0].lower(), r"bufet|buffet|all-you-can-eat")

    def test_no_promo_social_description_reuses_the_page_description(self):
        metadata = Metadata(ROOT / "no-promo/index.html").values
        self.assertEqual(metadata["og:description"], metadata["description"])

    def test_main_page_keeps_its_promotional_description(self):
        metadata = Metadata(ROOT / "index.html").values
        self.assertIn("Bufet all-you-can-eat", metadata["og:description"][0])


if __name__ == "__main__":
    unittest.main()
