FROM node:17-alpine3.14 as build 
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
RUN npm install
COPY . ./
ENV REACT_APP_API_URL <ADD-KRATOS-UI>
RUN npm run build


FROM nginx:alpine 
MAINTAINER Daniel Fuchs (daniel@fuchs-informatik.de)
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
