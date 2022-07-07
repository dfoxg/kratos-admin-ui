#!/bin/sh
##
# Usage: env2conf dir filename
# env2conf.sh public/config.json
##
mkdir -p "$(dirname "$1")" && touch "$1"
echo '{' >"$1"
echo '   "kratosAdminURL":"'$KRATOS_ADMIN_URL'",' >> "$1"
echo '   "kratosPublicURL":"'$KRATOS_PUBLIC_URL'"' >> "$1"
echo '}' >> "$1"