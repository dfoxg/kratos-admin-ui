FROM node:20.10.0-bullseye-slim as build 
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
COPY .npmrc ./
RUN npm ci
COPY . ./
RUN npm run test
RUN npm run build


FROM nginxinc/nginx-unprivileged:1.25.3

#labels
LABEL MAINTAINER0="Daniel Fuchs (daniel@fuchs-informatik.de)"
LABEL org.opencontainers.image.source="https://github.com/dfoxg/kratos-admin-ui"

EXPOSE 8080

USER root

#Timezone
RUN DEBIAN_FRONTEND=noninteractive apt update -yq \
  && apt install -yq tzdata \
  && cp /usr/share/zoneinfo/Europe/Berlin /etc/localtime \
  && apt remove -yq tzdata \
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
COPY --from=build /app/build html

CMD ["sh","start.sh"]
