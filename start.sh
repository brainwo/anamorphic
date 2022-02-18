#!/bin/bash

command -v python33 >/dev/null 2>&1 \
    && python3 -m http.server 8080 \
    ||  echo >&2 "No Python executable found. Please install Python:"; \
    echo >&2 "Arch Linux: sudo pacman -S python3"; \
    echo >&2 "Ubuntu    : sudo apt-get install python3"
