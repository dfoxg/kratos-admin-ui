#!/bin/sh
##
# Usage: env2conf dir filename
# env2conf.sh public/config.json
##

mkdir -p "$(dirname "$1")" && touch "$1"
echo '{' >"$1"
echo '   "reverseProxy": true' >> "$1"
echo '}' >> "$1"