"""
This is a script to serve a static website with some build processes.
"""
import argparse
import subprocess
import threading
from pathlib import Path

from flask import Flask, send_from_directory
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

SRC = Path('src')
DIST = Path('P1')


def build():
    """
    Build the static website.
    """
    assert SRC.exists(), f"Source directory {SRC} does not exist."
    DIST.mkdir(exist_ok=True, parents=True)

    # Build sass and scss into css
    to_build = list(SRC.glob('**/*.scss')) + list(SRC.glob('**/*.sass'))
    for file in to_build:
        target = (DIST / file.relative_to(SRC)).with_suffix('.css')
        subprocess.check_call(['sass', file, target])

    # Build html from template
    template_file = SRC / 'template.html'
    assert template_file.exists(), f"Template {template_file} does not exist."
    template = template_file.read_text('utf-8')

    for file in SRC.glob('**/*.html'):
        if file == template_file:
            continue

        # Build file
        target = (DIST / file.relative_to(SRC))
        head_extra = ''
        title = '1on1'

        # Process @ commands at the head of the file
        lines = file.read_text('utf-8').splitlines()
        while lines and lines[0].startswith('@'):
            command = lines.pop(0)[1:]
            command, args = command.split()[0], command.split()[1:]
            if command == 'css':
                head_extra += f'<link rel="stylesheet" href="{args[0]}">'
            if command == 'title':
                title += f' - {args[0]}'

        # If {filename}.sass / .scss / .css exist, automatically import it
        for suffix in ['sass', 'scss', 'css']:
            if file.with_suffix('.' + suffix).is_file():
                head_extra += f'<link rel="stylesheet" href="{file.relative_to(SRC).with_suffix(".css")}">'

        # Build html
        html = (template
                .replace('{{head_extra}}', head_extra)
                .replace('{{title}}', title)
                .replace('{{content}}', '\n'.join(lines))
                )

        target.write_text(html, 'utf-8')

    # Copy remaining files
    to_copy = SRC.glob('**/*')
    for file in to_copy:
        if file.is_dir():
            continue

        if file in to_build or file.name.endswith('.html'):
            continue

        target = (DIST / file.relative_to(SRC))
        target.parent.mkdir(exist_ok=True, parents=True)
        target.write_bytes(file.read_bytes())



app = Flask(__name__)


@app.route('/')
def index():
    """
    Serve the static website.
    """
    return send_from_directory(DIST, 'index.html')


@app.route('/<path:path>')
def view(path):
    """
    Serve the static website.
    """
    return send_from_directory(DIST, path)


building_lock = threading.Lock()


class RebuildHandler(FileSystemEventHandler):
    def on_any_event(self, event):
        global building_lock
        print(f"Change detected: {event.src_path}")
        if building_lock.acquire(blocking=False):
            try:
                build()
            finally:
                building_lock.release()
        else:
            print("Already building, skipping.")


if __name__ == '__main__':
    agupa = argparse.ArgumentParser()
    agupa.add_argument('--build-only', action='store_true')
    args = agupa.parse_args()

    if args.build_only:
        build()
        exit(0)

    # Start two threads,
    # one to monitor the src directory for any changes and re-build on change
    # another to serve the static website.
    event_handler = RebuildHandler()
    observer = Observer()
    observer.schedule(event_handler, path=str(SRC), recursive=True)
    observer.start()

    # Build the website
    build()

    # Serve the website
    app.run(host='0.0.0.0', port=8000)
