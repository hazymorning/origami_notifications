# Working on Origami Notifications

The card is written with Lit in `src`. `npm run build` bundles it into `dist/origami-notifications.js`, which HACS installs and which is committed. `npm test` builds the card and runs the tests. `npm test` and `npm run lint` must pass before every commit.

## Writing

This covers the readme, the card's texts, comments, commits, pull requests and release notes. All of it is in English, apart from the card's German strings.

- Short and plain. Say what the user sees and does.
- One thought per sentence. No colon in the middle of a sentence, no dash as punctuation, no emoji, no sales words.
- Never set a word in capitals for style, also not in pictures.
- A comment names a fact the code can't show, like a quirk of Home Assistant or a browser, in one or two lines. Never what the code does, and never how it came to be.
- Commit subjects say what changed in at most 50 characters. No trailers and no tool names.

## Code

- Use what Home Assistant offers before writing your own. That means the formatters and registries on `hass`, `hass-action`, its translations and its design tokens. Copy its logic only where it offers no other way, and name the source file.
- No code for cases nobody reported and Home Assistant itself does not handle.
- Change only what the task needs.
- Lit is the only runtime dependency.

## Tests

- One test per behavior a user would notice, named like a sentence of the readme.
- Logic is tested against `src` in `test/model.test.js`. What needs a page is tested against the build in `test/card.test.js` and `test/editor.test.js`.

## Pull requests and releases

One open pull request at a time. Its title and body follow the writing rules. `version` in `package.json` changes only for a release. When a pull request with a new version is merged, its body becomes the notes of that release.

Release notes are one or two short sentences in plain, everyday words about what changed for people who use the card. They never address the reader as you and never name code.
