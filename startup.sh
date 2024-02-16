#!/usr/bin/env bash

# Check if sudo is installed
if ! command -v sudo &> /dev/null
then
    echo "sudo is not installed, checking if user has root privileges..."
    if [ "$EUID" -ne 0 ]
    then
        echo "! Your user do not have root privileges, and sudo is not installed."
        echo "! Please install sudo and run the script again."
        exit
    fi

    echo "> User has root privileges, but sudo is not installed. Installing sudo..."
    apt-get update
    apt-get install sudo -y
fi

# Check for Python and Poetry
if ! command -v python3 &> /dev/null
then
    echo "Python 3 is not installed. Installing Python 3..."
    sudo apt-get update
    sudo apt-get install python3 python3-pip python3-poetry -y
fi

# Install dependencies using Poetry
echo "Installing dependencies..."
poetry install

# Running migrations
echo "Running migrations..."
poetry run python manage.py migrate

echo "Starting server..."
poetry run python manage.py runserver
