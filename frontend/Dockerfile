# We are using node version 22
FROM node:22

# Set the working directory within docker image
WORKDIR /usr/src/app

# Install dependencies
COPY package.json .
RUN npm cache clean --force \
    && npm install @jridgewell/sourcemap-codec @rollup/plugin-terser lru-cache \
    && npm install \
    && npm audit fix --force

# Expose port 3000
EXPOSE 3000