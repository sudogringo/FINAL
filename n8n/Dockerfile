# Base, n8n and community node pinned to the versions found in the image that
# ran this project (final-n8n:latest, inspected 08/10/2026): Node 24.21.0 on
# Alpine 3.24, n8n 2.27.5, n8n-nodes-puppeteer 1.5.0. Chromium comes from the
# Alpine 3.24 repos (152.0.7977.82-r0 at that date) and is not pinned further,
# because Alpine drops superseded package versions from its mirrors.
FROM node:24.21.0-alpine3.24

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
    npm install n8n-nodes-puppeteer@1.5.0

RUN chown -R node:node /n8n-custom

USER node
WORKDIR /home/node
ENTRYPOINT ["n8n"]
