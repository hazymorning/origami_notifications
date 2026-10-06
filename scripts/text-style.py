#!/usr/bin/env python3
"""Flags the marks of machine-written text in the tracked files and in the commits this
branch adds on top of main. With --stdin it checks one text, like a pull request body."""

import argparse
import re
import subprocess
import sys

SKIP = {'scripts/text-style.py'}  # it holds the patterns
MAX_SUBJECT = 72
MAX_WORDS = 30
MAX_COMMENT_LINES = 3
MAX_README_WORDS = 600

# The brand mark ◪ in the readme title is a shape, not an emoji.
EMOJI = re.compile(r'[\U0001f000-\U0001faff⌀-⏿■-◩◫-◿☀-➿⬀-⯿️]')
SALES = re.compile(
    r'(?i)\b(seamless(ly)?|effortless(ly)?|delightful|cutting[- ]edge|game[- ]chang\w*|supercharge\w*|unleash\w*|'
    r'empower\w*|enhanc\w*|user[- ]friendly|leverag\w*|utiliz\w*|robust|powerful|intuitive(ly)?|sleek|elegant(ly)?|'
    r'beautiful(ly)?|stunning|comprehensive|streamlin\w*|versatile|lightweight|out of the box|hassle[- ]free|'
    r'crucial|pivotal|nahtlos\w*|mühelos\w*|leistungsstark\w*|intuitiv\w*|kinderleicht)\b'
)
FILLER = re.compile(
    r'(?i)\b(note that|please note|worth noting|keep in mind|in other words|let\'s|simply|easily|basically|'
    r'essentially|feel free|allows you to|enables you to|in order to|moreover|furthermore|additionally|importantly)\b'
)
SIGNATURES = [
    (re.compile(r'(?i)^\s*[a-z]+(-[a-z]+)*-by:\s'), 'a trailer'),
    (re.compile(r'(?i)^\s*claude[- ]session:'), 'a session trailer'),
    (re.compile(r'(?i)claude\.ai/code/(session|artifact)'), 'a session link'),
    (re.compile(r'(?i)\b(claude|anthropic)\b(?!\.md)'), 'the name of a writing tool or its vendor'),
    (re.compile(r'(?i)\b(ai|machine|llm)[- ](generated|written|authored|assisted)\b'), 'a machine named as the author'),
]
MID_COLON = re.compile(r'[^\s:]:\s+\S')
SPACED_DASH = re.compile(r'\S\s(--?|[–―])\s\S')


def words_only(text):
    """Prose without code, emphasis, links and tags, so their colons and dashes do not count."""
    text = re.sub(r'`[^`]*`', 'code', text)
    text = re.sub(r'\*\*|__', '', text)
    text = re.sub(r'!?\[([^\]]*)\]\([^)]*\)', r'\1', text)
    text = re.sub(r':\s+(?=https?://)', ' ', text)
    text = re.sub(r'https?://\S+', 'link', text)
    return re.sub(r'<[^>]+>', ' ', text)


def check_line(line):
    hits = []
    if re.search(r'—|&mdash;|&#8212;', line):
        hits.append('an em dash. Use a comma or a full stop.')
    if EMOJI.search(line):
        hits.append('an emoji')
    for m in dict.fromkeys(m.group(0) for m in SALES.finditer(line)):
        hits.append(f'"{m}" is a sales word. Say what it does.')
    for m in dict.fromkeys(m.group(0) for m in FILLER.finditer(line)):
        hits.append(f'"{m}" adds nothing. Drop it.')
    hits += [why for pattern, why in SIGNATURES if pattern.search(line)][:1]
    return hits


def paragraphs(text, markdown):
    """(line number, paragraph) for the prose in a text. Markdown code, tables and headings stay out."""
    out, buf, start, fence = [], [], 0, False
    for number, line in enumerate(text.splitlines(), 1):
        stripped = line.strip()
        if markdown and stripped.startswith(('```', '~~~')):
            fence, stripped = not fence, ''
        elif fence or (markdown and (stripped.startswith(('|', '#')) or re.match(r'^</?\w+[^>]*>$', stripped))):
            stripped = ''
        item = markdown and re.match(r'([-*+>]|\d+\.)\s', stripped)
        if (not stripped or item) and buf:
            out.append((start, ' '.join(buf)))
            buf = []
        if stripped:
            start = start if buf else number
            buf.append(re.sub(r'^([-*+>]|\d+\.)\s+', '', stripped) if markdown else stripped)
    if buf:
        out.append((start, ' '.join(buf)))
    return out


def check_prose(text, markdown):
    hits = []
    for number, paragraph in paragraphs(text, markdown):
        prose = words_only(paragraph)
        if MID_COLON.search(prose):
            hits.append((number, 'a colon in the middle of a sentence. Make it two sentences.'))
        if SPACED_DASH.search(prose):
            hits.append((number, 'a dash between words. Use a comma or a full stop.'))
        if re.search(r'\w!(\s|$)', prose):
            hits.append((number, 'an exclamation mark'))
        for sentence in re.split(r'(?<=[.!?])\s+', prose):
            if len(sentence.split()) > MAX_WORDS:
                hits.append((number, f'a sentence of {len(sentence.split())} words, at most {MAX_WORDS}'))
    return hits


def comments(path, text):
    """(line number, text) of every comment in a code or workflow file."""
    found = []
    if path.endswith('.js'):
        for m in re.finditer(r'/\*(.*?)\*/', text, re.S):
            found.append((text.count('\n', 0, m.start()) + 1, re.sub(r'(?m)^\s*\*\s?', '', m.group(1))))
    marker = '//' if path.endswith('.js') else '#' if path.endswith(('.yml', '.yaml', '.py')) else None
    run = []
    for number, line in enumerate(text.splitlines() + [''], 1):
        stripped = line.strip()
        if marker and stripped.startswith(marker) and not stripped.startswith('#!'):
            run.append((number, stripped[len(marker):].strip()))
        elif run:
            found.append((run[0][0], '\n'.join(t for _, t in run)))
            run = []
    return found


def check_text(where, text, markdown=False, prose=True, path=None):
    hits = [(n, why) for n, line in enumerate(text.splitlines(), 1) for why in check_line(line)]
    if prose:
        hits += check_prose(text, markdown)
    for number, body in comments(path, text) if path else []:
        lines = body.strip().count('\n') + 1
        if lines > MAX_COMMENT_LINES:
            hits.append((number, f'a comment of {lines} lines, at most {MAX_COMMENT_LINES}'))
        hits += [(number + n - 1, why) for n, why in check_prose(body, markdown=False)]
    found = [f'{where}:{n}: {why}' for n, why in sorted(hits)]
    if path == 'README.md':
        count = sum(len(words_only(p).split()) for _, p in paragraphs(text, True))
        if count > MAX_README_WORDS:
            found.append(f'{where}: {count} words of prose, at most {MAX_README_WORDS}')
    return found


def git(*args):
    return subprocess.run(['git', *args], capture_output=True, text=True, check=True).stdout


def new_commits():
    """The commits on top of main, or only the tip where main is missing (a shallow checkout)."""
    for base in ('origin/main', 'main'):
        if subprocess.run(['git', 'rev-parse', '--verify', '--quiet', base], capture_output=True).returncode == 0:
            return git('rev-list', f'{base}..HEAD').split()
    return git('rev-list', '-1', 'HEAD').split()


def check_repository():
    hits = []
    for path in git('ls-files', '-z').split('\0'):
        if not path or path in SKIP:
            continue
        try:
            with open(path, encoding='utf-8') as fh:
                text = fh.read()
        except (OSError, UnicodeDecodeError):
            continue
        markdown = path.endswith('.md')
        hits += check_text(path, text, markdown=markdown, prose=markdown, path=path)
    for commit in new_commits():
        message = git('log', '-1', '--format=%B', commit).strip()
        subject = message.splitlines()[0] if message else ''
        # A merge subject is written by Git or GitHub, with the branch name in it.
        if subject.startswith('Merge ') or len(git('log', '-1', '--format=%P', commit).split()) > 1:
            message = message[len(subject):]
        elif len(subject) > MAX_SUBJECT:
            hits.append(f'commit {commit[:9]}: a subject of {len(subject)} characters, at most {MAX_SUBJECT}')
        hits += check_text(f'commit {commit[:9]}', message, markdown=True)
    return hits


def main(argv):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stdin', metavar='NAME', help='check one text from stdin, named NAME in the output')
    parser.add_argument('--limit', type=int, default=0, metavar='N', help='the most characters the text may have')
    options = parser.parse_args(argv)
    if options.stdin:
        text = sys.stdin.read().strip()
        hits = check_text(options.stdin, text, markdown=True)
        if options.limit and len(text) > options.limit:
            hits.append(f'{options.stdin}: {len(text)} characters, at most {options.limit}')
    else:
        hits = check_repository()
    for hit in hits:
        print(hit, file=sys.stderr)
    print('OK' if not hits else f'{len(hits)} findings', file=sys.stderr)
    return 1 if hits else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
