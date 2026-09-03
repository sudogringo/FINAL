FROM node:24-alpine

# Install chromium from Alpine repos (musl-compatible, no glibc needed)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    git

# Tell Puppeteer to use system Chromium, skip its own download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV N8N_CUSTOM_EXTENSIONS=/n8n-custom

# Install n8n globally. Pin the exact version at build time for a reproducible
# image: `docker build --build-arg N8N_VERSION=<x.y.z> .`
# The default `latest` is a convenience for local/staging, not for production.
ARG N8N_VERSION=latest
RUN npm install -g "n8n@${N8N_VERSION}"

# Install community node in fixed path
RUN mkdir -p /n8n-custom && \
    cd /n8n-custom && \
    npm init -y && \
    npm install n8n-nodes-puppeteer

RUN chown -R node:node /n8n-custom

USER node
WORKDIR /home/node
ENTRYPOINT ["n8n"]
