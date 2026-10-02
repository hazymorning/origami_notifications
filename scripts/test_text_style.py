"""Examples of what scripts/text-style.py flags and what it lets through."""

import pathlib
import subprocess
import sys
import unittest

SCRIPT = pathlib.Path(__file__).with_name('text-style.py')


def hits(text):
    run = subprocess.run([sys.executable, SCRIPT, '--stdin', 't'], input=text, capture_output=True, text=True)
    return run.stderr.strip().splitlines()


class Flags(unittest.TestCase):
    def test_marks(self):
        for text in [
            'The card — and only the card.',
            'Done ✅',
            'Alarm at 7 ⏰',
            'Moreover, it hides.',
            'A seamless way to see updates.',
            'A powerful, lightweight card.',
            'Note that the list scrolls.',
            'It simply works.',
            'In order to hide it, set false.',
            'Co-authored-by: someone',
            'Written with Claude.',
            'Install it with HACS: add the repository.',
            'Closed it shows one line - open it shows all.',
            'That is it!',
            '- **Updates**: shown with an install button.',
            'This sentence goes on and on and on, adding one more word and then another one, until nobody remembers how it started or what it wanted to say in the first place, if anything at all.',
        ]:
            with self.subTest(text=text):
                self.assertTrue(hits(text))


class Passes(unittest.TestCase):
    def test_plain(self):
        for text in [
            'Tap the card to open the list.',
            'Set `type: picture` to use the state as the title.',
            'The event starts at 10:30.',
            'See https://example.com/a:b for details.',
            'Add this to your dashboard:',
            '```yaml\nentities:\n  - binary_sensor.door  # while it is on\n```',
            '| `css` | string | Your own CSS. |',
            '- Updates come with an install button.',
            'A well-known, built-in feature.',
            'The rules are in CLAUDE.md.',
        ]:
            with self.subTest(text=text):
                self.assertEqual(hits(text), [])


if __name__ == '__main__':
    unittest.main()
