import unittest

import clean_markdown


class TestCleanMarkdown(unittest.TestCase):
    def test_removes_word_comment_markers(self):
        sample = "a\n[/***]\n\nkeep\n[***/]\n[///txt]\n[txt///]\n"
        self.assertEqual(
            clean_markdown.clean_markdown(sample, remove_strikethrough=False, remove_toc_links=True).rstrip(),
            "a\nkeep",
        )

    def test_removes_word_toc_links(self):
        sample = "[1 Arc 4](#_Toc200457262)\nkeep\n"
        self.assertEqual(
            clean_markdown.clean_markdown(sample, remove_strikethrough=False, remove_toc_links=True).rstrip(),
            "keep",
        )
