#!/bin/bash

source venv/bin/activate

if [ "$1" == "--build-only" ]
then
    python3 serve.py --build-only
else
    python3 serve.py
fi