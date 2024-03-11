#!/usr/bin/env bash
source venv/bin/activate
rm -rf db.sqlite3
poetry run python manage.py makemigrations
poetry run python manage.py migrate
poetry run python manage.py runserver