FROM node:22-alpine AS builder
WORKDIR /app
ENV PATH="/app/node_modules/.bin:$PATH"
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run test
RUN npm run build

FROM ghcr.io/static-web-server/static-web-server:2 AS runner

LABEL MAINTAINER0="Daniel Fuchs (daniel@fuchs-informatik.de)"
LABEL org.opencontainers.image.source="https://github.com/dfoxg/kratos-admin-ui"

ENV SERVER_COMPRESSION_LEVEL=fastest \
    SERVER_FALLBACK_PAGE=index.html \
    SERVER_ERROR_PAGE_404=index.html \
    SERVER_HEALTH=true \
    SERVER_LOG_FORWARDED_FOR=true \
    SERVER_LOG_REMOTE_ADDRESS=true \
    SERVER_PORT=8080

COPY --from=builder /app/dist /public
