if [ -z ${KRATOS_ADMIN_URL+x} ]; then 
    echo "KRATOS_ADMIN_URL is unset. Please set the environment variable 'KRATOS_ADMIN_URL'";
    exit 2
fi
if [ -z ${KRATOS_PUBLIC_URL+x} ]; then 
    echo "KRATOS_PUBLIC_URL is unset.  Please set the environment variable 'KRATOS_PUBLIC_URL'";
    exit 3
fi

sh env2conf.sh /usr/share/nginx/html/config.json
nginx -g "daemon off;"