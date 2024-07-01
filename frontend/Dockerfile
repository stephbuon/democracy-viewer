# We are using node version 21
FROM node:21

# Set the working directory within docker image
WORKDIR /usr/src/app

# Install dependencies
COPY package.json .
RUN npm install

# Expose port 3000
EXPOSE 3000