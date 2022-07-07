FROM node:17-alpine3.14 as build 
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build


FROM nginx:alpine 

#labels
LABEL MAINTAINER0="Daniel Fuchs (daniel@fuchs-informatik.de)"
LABEL org.opencontainers.image.source="https://github.com/dfoxg/kratos-admin-ui"

WORKDIR /usr/share/nginx
EXPOSE 80

# copy sources and config
COPY --from=build /app/build html
COPY nginx.conf /etc/nginx/conf.d/default.conf

#environment
COPY start.sh start.sh
COPY env2conf.sh env2conf.sh

#Timezone
RUN apk upgrade --update \
  && apk add -U tzdata \
  && cp /usr/share/zoneinfo/Europe/Berlin /etc/localtime \
  && apk del tzdata \
  && rm -rf \
  /var/cache/apk/*

CMD ["sh","start.sh"]
