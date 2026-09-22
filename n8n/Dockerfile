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

# Install n8n globally, pinned to the version that actually ran this project's
# workflows (verified via `docker run --rm --entrypoint n8n final-n8n:latest --version`).
# Override at build time if needed: `docker build --build-arg N8N_VERSION=<x.y.z> .`
ARG N8N_VERSION=2.27.5
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
