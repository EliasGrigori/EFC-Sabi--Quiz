#!/bin/bash
# monta dist/index.html a partir de src/ (index.html + live.css + live.js + qrcode.js) + modelos.json
D=$(dirname "$0"); python3 "$D/montar.py" "$D"
