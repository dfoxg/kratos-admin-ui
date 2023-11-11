FROM node:20.9.0-bullseye-slim as build 
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
COPY .npmrc ./
RUN npm ci
COPY . ./
RUN npm run test
RUN npm run build


FROM nginx:alpine 

#labels
LABEL MAINTAINER0="Daniel Fuchs (daniel@fuchs-informatik.de)"
LABEL org.opencontainers.image.source="https://github.com/dfoxg/kratos-admin-ui"

WORKDIR /usr/share/nginx
EXPOSE 80

#Timezone
RUN apk upgrade --update \
  && apk add -U tzdata \
  && cp /usr/share/zoneinfo/Europe/Berlin /etc/localtime \
  && apk del tzdata \
  && rm -rf \
  /var/cache/apk/*

#environment
COPY deploy/start.sh start.sh
COPY deploy/env2conf.sh env2conf.sh
COPY deploy/nginx.conf /etc/nginx/templates/default.conf.template

# copy sources and config
COPY --from=build /app/build html

CMD ["sh","start.sh"]
