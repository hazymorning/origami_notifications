# Working on Origami Notifications

The whole card is `dist/origami-notifications.js`, with no build step and no runtime dependencies. `npm test` runs the card tests and `npm run lint` checks every text. Both must pass before every commit.

## Writing

This covers the readme, the texts the card shows, code comments, commit messages, pull requests and release notes. All of it is in English, apart from the card's German strings.

- Short and plain. If a sentence can go, it goes.
- If something can't be said in plain words, understand it better before writing it down.
- Say what the user sees and does, not how the code does it.
- One thought per sentence. No colon in the middle of a sentence, no dash as punctuation, no emoji, no sales words, no filler.
- Comment only what the code can't say itself, usually a Home Assistant quirk. One or two lines, three at most.
- Commit subjects say what changed in at most 72 characters. No trailers and no tool names, anywhere.
- `npm run lint` catches the obvious cases. Passing it is the minimum, not the goal.

## Code

- Change only what the task needs. Configs from older versions keep working.
- Every fix and every new behavior gets a test in `test/card.test.js`.
- Write like the code around it. No new dependencies.
- `VERSION` in the card and `version` in `package.json` change together, and only for a release.

## Pull requests

One open pull request at a time. Its title and body follow the writing rules above.
