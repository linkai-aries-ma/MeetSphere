#!/usr/bin/env bash

export DEBIAN_FRONTEND=noninteractive

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
    apt-get update -y
    apt-get install sudo -y
fi

# Check for Python and Poetry
if ! command -v python3.12 &> /dev/null
then
    echo "Python 3 is not installed. Installing Python 3..."
    sudo apt-get install software-properties-common -y
    sudo add-apt-repository ppa:deadsnakes/ppa -y
    sudo DEBIAN_FRONTEND=noninteractive apt-get update -y
    sudo DEBIAN_FRONTEND=noninteractive apt-get install python3.12 python3.12-venv python3.12-distutils python3-pip -y
fi

# Install dependencies using Poetry
echo "Installing dependencies..."
python3.12 -m venv venv
source venv/bin/activate
pip install poetry
poetry install
