"""Examples of what scripts/text-style.py flags and what it lets through."""

import importlib.util
import pathlib
import subprocess
import sys
import unittest

SCRIPT = pathlib.Path(__file__).with_name('text-style.py')
spec = importlib.util.spec_from_file_location('text_style', SCRIPT)
style = importlib.util.module_from_spec(spec)
spec.loader.exec_module(style)


def hits(text):
    run = subprocess.run([sys.executable, SCRIPT, '--stdin', 't'], input=text, capture_output=True, text=True)
    assert 'Traceback' not in run.stderr, run.stderr
    assert run.returncode == (1 if run.stderr else 0), run
    return run.stderr.strip().splitlines()


class Flags(unittest.TestCase):
    def test_marks(self):
        for text, why in [
            ('The card — and only the card.', 'em dash'),
            ('The card &mdash; and only the card.', 'em dash'),
            ('Done ✅', 'emoji'),
            ('Alarm at 7 ⏰', 'emoji'),
            ('/* ========== Rows ========== */', 'banner'),
            ('Moreover, it hides.', '"Moreover" adds nothing'),
            ('A seamless way to see updates.', '"seamless" is a sales word'),
            ('A powerful, lightweight card.', '"powerful" is a sales word'),
            ('This PR enhances the editor.', '"enhances" is a sales word'),
            ('Note that the list scrolls.', '"Note that" adds nothing'),
            ('It simply works.', '"simply" adds nothing'),
            ('In order to hide it, set false.', '"In order to" adds nothing'),
            ('Co-authored-by: someone', 'co-author trailer'),
            ('Written with Claude.', 'writing tool'),
            ('Install it with HACS: add the repository.', 'colon in the middle'),
            ('**Note:** The list scrolls.', 'colon in the middle'),
            ('> Tip: the list scrolls.', 'colon in the middle'),
            ('Closed it shows one line - open it shows all.', 'dash between words'),
            ('Closed it shows one line -- open it shows all.', 'dash between words'),
            ('That is it!', 'exclamation mark'),
            ('- **Updates** come with an install button.', 'bold label'),
            ('This sentence goes on and on and on, adding one more word and then another one, until nobody remembers how it started or what it wanted to say in the first place, if anything at all.', 'a sentence of 36 words'),
        ]:
            with self.subTest(text=text):
                self.assertTrue(any(why in hit for hit in hits(text)), hits(text))

    def test_comments(self):
        long = '/* One.\n * Two.\n * Three.\n * Four. */\nconst a = 1;\n'
        self.assertTrue(any('comment of 4 lines' in hit for hit in style.check_text('x.js', long, prose=False, path='x.js')))
        colon = '// Hidden cards: they stay.\nconst a = 1;\n'
        self.assertTrue(any('colon' in hit for hit in style.check_text('x.js', colon, prose=False, path='x.js')))
        self.assertEqual(style.check_text('x.js', 'const s = "a: b";\n', prose=False, path='x.js'), [])

    def test_readme_limit(self):
        text = '\n\n'.join(['One word after another.'] * (style.MAX_README_WORDS // 4 + 1))
        found = style.check_text('README.md', text, markdown=True, path='README.md')
        self.assertTrue(any('words of prose' in hit for hit in found), found)
        self.assertEqual(style.check_text('notes.md', text, markdown=True, path='notes.md'), [])


class Passes(unittest.TestCase):
    def test_plain(self):
        for text in [
            'Tap the card to open the list.',
            'Set `type: picture` to use the state as the title.',
            'The event starts at 10:30.',
            'See https://example.com/a:b for details.',
            '**Full Changelog**: https://github.com/a/b/compare/v1...v2',
            'Add this to your dashboard:',
            '```yaml\nentities:\n  - binary_sensor.door  # while it is on\n```',
            '| `css` | string | Your own CSS. |',
            '| Option | Default |\n| ----------------- | ---------- |\n| `css` | none |',
            '- Updates come with an install button.',
            'A well-known, built-in feature.',
            'The door is unlocked.',
            'The rules are in CLAUDE.md.',
        ]:
            with self.subTest(text=text):
                self.assertEqual(hits(text), [])


if __name__ == '__main__':
    unittest.main()
