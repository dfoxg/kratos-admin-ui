#!/bin/sh
##
# Usage: env2conf dir filename
# env2conf.sh public/config.json
##

if [ -z ${KRATOS_ADMIN_URL+x} ]; then 
    echo "KRATOS_ADMIN_URL is unset. Please set the environment variable 'KRATOS_ADMIN_URL'";
    exit 2
fi
if [ -z ${KRATOS_PUBLIC_URL+x} ]; then 
    echo "KRATOS_PUBLIC_URL is unset.  Please set the environment variable 'KRATOS_PUBLIC_URL'";
    exit 3
fi

mkdir -p "$(dirname "$1")" && touch "$1"
echo '{' >"$1"
echo '   "kratosAdminURL":"'$KRATOS_ADMIN_URL'",' >> "$1"
echo '   "kratosPublicURL":"'$KRATOS_PUBLIC_URL'"' >> "$1"
echo '}' >> "$1"