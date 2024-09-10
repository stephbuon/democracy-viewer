# We are using node version 18
FROM node:18

# Set the working directory within docker image
WORKDIR /usr/src/app

# Install dependencies
COPY . .
RUN npm install

# Compile production build
RUN npm install -g serve
RUN npm run build

# Expose port 3000
EXPOSE 3000