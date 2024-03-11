#!/usr/bin/env bash
source venv/bin/activate
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

# Start the server
poetry run python manage.py runserver
