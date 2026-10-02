#!/usr/bin/env python3
"""Flags the marks of machine-written text in the tracked files and in the commits this
branch adds on top of main. With --stdin it checks one text, like a pull request body."""

import argparse
import re
import subprocess
import sys

SKIP = {'scripts/text-style.py', 'scripts/test_text_style.py'}  # these hold the patterns
MAX_SUBJECT = 72
MAX_WORDS = 30
MAX_COMMENT_LINES = 3
MAX_README_WORDS = 600

EMOJI = re.compile(r'[\U0001f000-\U0001faff\u2300-\u23ff\u25a0-\u25ff\u2600-\u27bf\u2b00-\u2bff\ufe0f]')
BANNER = re.compile(r'[\u2500-\u257f]{3,}|[-=*#/]{8,}')

BUZZWORDS = re.compile(
    r'(?i)\b('
    r'seamless(ly)?|effortless(ly)?|delightful|cutting[- ]edge|state[- ]of[- ]the[- ]art|best[- ]in[- ]class|'
    r'game[- ]chang\w*|supercharge\w*|delve[sd]?|testament to|elevate[sd]? (your|the)|unlock(s|ing)? (your|the full|new)|'
    r'unleash\w*|empower\w*|enhanc\w*|user[- ]friendly|'
    r'leverag\w*|utiliz\w*|robust|powerful|intuitive(ly)?|sleek|elegant(ly)?|beautiful(ly)?|stunning|'
    r'comprehensive|streamlin\w*|versatile|lightweight|blazing(ly)?|lightning[- ]fast|out of the box|'
    r'under the hood|hassle[- ]free|with ease|a breeze|first[- ]class|(fully|highly) customi[sz]able|'
    r'plethora|myriad|crucial|pivotal|tapestry|embark\w*|holistic|synerg\w*|'
    r'nahtlos\w*|mühelos\w*|revolutionär\w*|kinderleicht|im Handumdrehen|leistungsstark\w*|'
    r'maßgeschneidert\w*|ganzheitlich\w*|zukunftssicher\w*|intuitiv\w*|spielend leicht|Mehrwert'
    r')\b'
)

FILLER = re.compile(
    r'(?i)\b('
    r'note that|please note|in essence|needless to say|it is (important|worth) (to note|noting)|worth noting|'
    r'worth mentioning|keep in mind|in other words|at the end of the day|let\'s|whether you\'re|not just|'
    r'not only|simply|easily|basically|essentially|feel free|happy automating|allows you to|enables you to|'
    r'in order to|moreover|furthermore|additionally|importantly|'
    r'es sei angemerkt|es ist wichtig zu (beachten|erwähnen)|im Grunde|grundsätzlich'
    r')\b'
)

SIGNATURES = [
    (re.compile(r'(?i)^\s*co-authored-by:'), 'a co-author trailer'),
    (re.compile(r'(?i)^\s*claude[- ]session:'), 'a session trailer'),
    (re.compile(r'(?i)^\s*[a-z]+(-[a-z]+)*-by:\s'), 'a trailer'),
    (re.compile(r'(?i)claude\.ai/code/(session|artifact)'), 'a session link'),
    (re.compile(r'(?i)\b(claude|anthropic)\b(?!\.md)'), 'the name of a writing tool or its vendor'),
    (re.compile(r'(?i)\bgenerated (with|by)\s+\[?(an? )?(ai|llm|language model|chatgpt|copilot|gemini|gpt)\b'), 'a "generated with" line'),
    (re.compile(r'(?i)\b(ai|machine|llm)[- ](generated|written|authored|assisted)\b'), 'a machine named as the author'),
    (re.compile(r'(?i)\b(written|authored|created) by (an? )?(ai|llm|language model|assistant|bot)\b'), 'a machine named as the author'),
]

# Prose rules run on Markdown outside code, on comments, and on commit, pull request and release texts.
MID_COLON = re.compile(r'[^\s:]:\s+\S')
SPACED_DASH = re.compile(r'\S\s(--?|[–―])\s\S')
EXCLAMATION = re.compile(r'\w!(\s|$)')
BOLD_LABEL = re.compile(r'^\s*([-*+]|\d+\.)\s+(\*\*|__)')


def words_only(text):
    """Prose without inline code, emphasis, link targets, URLs and tags, so their colons and dashes do not count.
    A colon right before a link introduces it, like in a release footer."""
    text = re.sub(r'`[^`]*`', 'code', text)
    text = re.sub(r'\*\*|__', '', text)
    text = re.sub(r'!?\[([^\]]*)\]\([^)]*\)', r'\1', text)
    text = re.sub(r':\s+(?=https?://)', ' ', text)
    text = re.sub(r'https?://\S+', 'link', text)
    return re.sub(r'<[^>]+>', ' ', text)


def check_line(line, markdown=False):
    hits = []
    if re.search(r'—|&mdash;|&#8212;', line):
        hits.append('an em dash. Use a comma or a full stop.')
    if EMOJI.search(line):
        hits.append('an emoji')
    # Table rules and heading underlines in Markdown are structure, not banners.
    if BANNER.search(line) and not (markdown and re.fullmatch(r'[\s|:=-]+', line)):
        hits.append('a banner line. Drop it.')
    for m in dict.fromkeys(m.group(0) for m in BUZZWORDS.finditer(line)):
        hits.append(f'"{m}" is a sales word. Say what it does.')
    for m in dict.fromkeys(m.group(0) for m in FILLER.finditer(line)):
        hits.append(f'"{m}" adds nothing. Drop it.')
    for pattern, why in SIGNATURES:
        if pattern.search(line):
            hits.append(why)
            break
    return hits


def paragraphs(text, markdown):
    """(line number, paragraph) for the prose in a text. Markdown code, tables and headings stay out."""
    out, buf, start, fence = [], [], 0, None
    for number, line in enumerate(text.splitlines(), 1):
        stripped = line.strip()
        if markdown and re.match(r'(`{3,}|~{3,})', stripped):
            marker = stripped[:3]
            fence = None if fence == marker else fence or marker
            stripped = ''
        elif fence or (markdown and (stripped.startswith(('|', '#')) or re.match(r'^</?\w+[^>]*>$', stripped))):
            stripped = ''
        elif markdown and stripped.startswith('>'):
            stripped = stripped.lstrip('> ')
        new_item = markdown and re.match(r'([-*+]|\d+\.)\s', stripped)
        if not stripped or new_item:
            if buf:
                out.append((start, ' '.join(buf)))
            buf = []
        if stripped:
            if not buf:
                start = number
            buf.append(re.sub(r'^([-*+]|\d+\.)\s+', '', stripped) if markdown else stripped)
    if buf:
        out.append((start, ' '.join(buf)))
    return out


def check_prose(text, markdown):
    hits = []
    if markdown:
        hits += [(n, 'a list item that starts with a bold label') for n, line in enumerate(text.splitlines(), 1) if BOLD_LABEL.match(line)]
    for number, paragraph in paragraphs(text, markdown):
        prose = words_only(paragraph)
        if MID_COLON.search(prose):
            hits.append((number, 'a colon in the middle of a sentence. Make it two sentences.'))
        if SPACED_DASH.search(prose):
            hits.append((number, 'a dash between words. Use a comma or a full stop.'))
        if EXCLAMATION.search(prose):
            hits.append((number, 'an exclamation mark'))
        for sentence in re.split(r'(?<=[.!?])\s+', prose):
            count = len(sentence.split())
            if count > MAX_WORDS:
                hits.append((number, f'a sentence of {count} words, at most {MAX_WORDS}'))
    return hits


def comments(path, text):
    """(line number, text) of every comment in a code or workflow file."""
    found = []
    if path.endswith('.js'):
        for m in re.finditer(r'/\*(.*?)\*/', text, re.S):
            body = re.sub(r'(?m)^\s*\*\s?', '', m.group(1))
            found.append((text.count('\n', 0, m.start()) + 1, body))
    marker = '//' if path.endswith('.js') else '#' if path.endswith(('.yml', '.yaml', '.py')) else None
    if marker:
        run = []
        for number, line in enumerate(text.splitlines() + [''], 1):
            stripped = line.strip()
            if stripped.startswith(marker) and not stripped.startswith('#!'):
                run.append((number, stripped[len(marker):].strip()))
                continue
            if run:
                found.append((run[0][0], '\n'.join(t for _, t in run)))
            run = []
    return found


def check_comments(path, text):
    """Comments in code and workflows are short and follow the prose rules."""
    hits = []
    for number, body in comments(path, text):
        lines = body.strip().count('\n') + 1
        if lines > MAX_COMMENT_LINES:
            hits.append((number, f'a comment of {lines} lines, at most {MAX_COMMENT_LINES}'))
        hits += [(number + n - 1, why) for n, why in check_prose(body, markdown=False)]
    return hits


def check_text(where, text, markdown=False, prose=True, path=None):
    hits = [(n, why) for n, line in enumerate(text.splitlines(), 1) for why in check_line(line, markdown)]
    if prose:
        hits += check_prose(text, markdown)
    if path:
        hits += check_comments(path, text)
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
        # Git or GitHub writes a merge subject, with the branch name in it. A shallow checkout has no
        # parents to count, so the subject decides as well.
        if len(git('log', '-1', '--format=%P', commit).split()) > 1 or subject.startswith('Merge '):
            message = '\n' + message[len(subject):]
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
    return 1 if hits else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
