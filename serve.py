"""
This is a script to serve a static website with some build processes.
"""
import argparse
import os
import subprocess
import threading
import time
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
        title = 'MeetSphere'

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
    # Check if {path} exists
    if (DIST / path).is_file():
        return send_from_directory(DIST, path)

    # Check if {path}.html exists
    if (DIST / path).with_suffix('.html').is_file():
        return send_from_directory(DIST, path + '.html')


building_lock = threading.Lock()
pending_build = False
pending_shutdown = False


class RebuildHandler(FileSystemEventHandler):
    def on_modified(self, event):
        self.process_event(event)

    def on_created(self, event):
        self.process_event(event)

    def on_deleted(self, event):
        self.process_event(event)

    def on_moved(self, event):
        self.process_event(event)

    def process_event(self, event):
        global building_lock, pending_build
        print(event)

        # Wait some time to prevent multiple events from being triggered at once causing lag
        pending_build = True


def build_thread():
    # Infinite loop to check and rebuild
    while not pending_shutdown:
        global building_lock, pending_build
        time.sleep(0.5)

        with building_lock:
            if pending_build:
                start = time.time()
                print("Building...")
                pending_build = False
                try:
                    build()
                except Exception as e:
                    print(f"Error building: {e}")
                print(f"> Done building in {time.time() - start:.2f}s")


if __name__ == '__main__':
    agupa = argparse.ArgumentParser()
    agupa.add_argument('--build-only', action='store_true')
    args = agupa.parse_args()

    if args.build_only:
        build()
        exit(0)

    # Start three threads,
    # one to monitor the src directory for any changes and queue re-build on change
    # another one to actually rebuild the website
    # another to serve the static website.
    event_handler = RebuildHandler()
    observer = Observer()
    observer.schedule(event_handler, path=str(SRC), recursive=True)
    observer.start()

    # Start the build thread
    build_thread = threading.Thread(target=build_thread)
    build_thread.start()

    # Build the website
    build()

    # Serve the website
    try:
        app.run(host='0.0.0.0', port=8000)
    except KeyboardInterrupt:
        pending_shutdown = True
        observer.stop()
        observer.join()
        build_thread.join()
        print("Goodbye!")
        os._exit(0)
