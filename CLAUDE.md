# Working on Origami Notifications

The card is `dist/origami-notifications.js`, with no build step and no runtime dependencies. `npm test` and `npm run lint` must pass before every commit.

## Writing

This covers the readme, the card's texts, comments, commits, pull requests and release notes. All of it is in English, apart from the card's German strings.

- Short and plain. Say what the user sees and does.
- One thought per sentence. No colon in the middle of a sentence, no dash as punctuation, no emoji, no sales words.
- Comment only what the code can't say, at most three lines.
- Commit subjects say what changed in at most 72 characters. No trailers and no tool names.

## Code

- Change only what the task needs. Configs from older versions keep working.
- Tests cover what the card must keep doing, not every fix. Add a check to an existing test before you add a test, and keep the suite under 60 tests.
- No new dependencies. `VERSION` in the card and `version` in `package.json` change together, and only for a release.

## Pull requests

One open pull request at a time. Its title and body follow the writing rules.
