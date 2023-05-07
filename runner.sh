#!/bin/sh

python3 -m http.server 8000 &
P1=$!

python3 backend/api.py
P2=$!

wait $P1 $P2