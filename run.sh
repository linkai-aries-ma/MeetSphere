#!/usr/bin/env bash

# If venv exists, activate it
if [ -d "venv" ]; then
  source venv/bin/activate
fi

rm -rf db.sqlite3
poetry run python manage.py makemigrations
poetry run python manage.py migrate

# Check if "test" is passed as an argument
if [ "$1" = "test" ]
then
  nohup poetry run python manage.py runserver
  pid=$!

  # Wait for the server to start
  while ! nc -z localhost 8000; do
    sleep 0.1
  done

  # Run the tests
  yarn jest

  # Kill the server
  kill -9 $pid

  exit
fi

# Check if we're running for production
if [ "$1" = "production" ]; then
  poetry run gunicorn backend.wsgi:application -b 0.0.0.0:8000
else
  poetry run python manage.py runserver 0.0.0.0:8000
fi
