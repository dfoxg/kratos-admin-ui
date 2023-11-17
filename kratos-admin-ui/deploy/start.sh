if [ -z ${NAMESERVER+x} ]; then
    if [ -f /etc/resolv.conf ]; then
        export NAMESERVER=$(awk '/^nameserver/{print $2}' /etc/resolv.conf)
    else
        # see https://www.emmanuelgautier.com/blog/nginx-docker-dns-resolution
        export NAMESERVER="127.0.0.11"
    fi
fi

echo "Nameserver is: $NAMESERVER"

checkFormat() {
    regex="http?(s)://"
    if [ "$1" == $regex* ]; then
        echo "setting $2 to $1"
    else
        echo "$2 = $1"
        echo "environment $2 doesnt start with http:// or https://. Reverse proxy could not be set" 
        exit 4
    fi
}

if [ -z ${KRATOS_ADMIN_URL+x} ]; then 
    echo "KRATOS_ADMIN_URL is unset. Please set the environment variable 'KRATOS_ADMIN_URL'";
    exit 2
#else
    #checkFormat ${KRATOS_ADMIN_URL} "KRATOS_ADMIN_URL"
fi

if [ -z ${KRATOS_PUBLIC_URL+x} ]; then 
    echo "KRATOS_PUBLIC_URL is unset.  Please set the environment variable 'KRATOS_PUBLIC_URL'";
    exit 3
#else
    #checkFormat ${KRATOS_PUBLIC_URL} "KRATOS_PUBLIC_URL"
fi

sh env2conf.sh /usr/share/nginx/html/config.json



/docker-entrypoint.sh nginx -g "daemon off;"