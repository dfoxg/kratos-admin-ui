FROM node:24-alpine AS build
WORKDIR /app
COPY . ./
RUN npm ci \
    && npm run test \
    && npm run build

FROM nginxinc/nginx-unprivileged:1.29.2

#labels
LABEL MAINTAINER0="Daniel Fuchs (daniel@fuchs-informatik.de)"
LABEL org.opencontainers.image.source="https://github.com/dfoxg/kratos-admin-ui"

EXPOSE 8080
USER root

#Timezone
RUN DEBIAN_FRONTEND=noninteractive apt update -y \
  && apt install -y tzdata \
  && cp /usr/share/zoneinfo/Europe/Berlin /etc/localtime \
  && apt remove -y tzdata \
  && rm -rf \
  /var/cache/apt/*

#fall back to nginx's user (numeric because k8s)
USER 101:101
WORKDIR /usr/share/nginx

#environment
COPY deploy/start.sh start.sh
COPY deploy/env2conf.sh env2conf.sh
COPY deploy/nginx.conf /etc/nginx/templates/default.conf.template

# copy sources and config
COPY --from=build /app/dist html

# Required, since the config.json got overwritten at start
USER root
RUN chmod o+w /usr/share/nginx/html/config.json
USER 101:101

CMD ["sh","start.sh"]
