FROM node:17-alpine3.14 as build 
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY . ./
ENV REACT_APP_KRATOS_ADMIN_URL <ADD-KRATOS-ADMIN-URL>
ENV REACT_APP_KRATOS_PUBLIC_URL <ADD-KRATOS-PUBLIC-URL>
RUN npm run build


FROM nginx:alpine 
LABEL MAINTAINER Daniel Fuchs (daniel@fuchs-informatik.de)
LABEL org.opencontainers.image.source https://github.com/dfoxg/kratos-admin-repo
WORKDIR /usr/share/nginx
EXPOSE 80
COPY --from=build /app/build html
COPY nginx.conf /etc/nginx/conf.d/default.conf
#Timezone
RUN apk upgrade --update \
  && apk add -U tzdata \
  && cp /usr/share/zoneinfo/Europe/Berlin /etc/localtime \
  && apk del tzdata \
  && rm -rf \
  /var/cache/apk/*
CMD ["nginx", "-g", "daemon off;"]
