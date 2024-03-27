# We are using node version 16
# FROM node:16
FROM python:3.11

# Set the working directory within docker image
WORKDIR /usr/src/app

# Install node
RUN apt-get update
# install curl 
RUN apt-get install curl
# get install script and pass it to execute: 
RUN curl -sL https://deb.nodesource.com/setup_21.x | bash
# and install node 
RUN apt-get install nodejs
# confirm that it was successful 
RUN node -v && sleep 3
# npm installs automatically 
RUN npm -v && sleep 3

# Install node dependencies
COPY package.json .
RUN npm install

# Install Python
# ADD install_python.sh .
# RUN sudo ./install_python
RUN python3 --version && sleep 3

# Install Python dependencies
ADD requirements.txt .
RUN python3 -m pip install -r requirements.txt

# Install SQL clients
### PostgreSQL
RUN apt-get install postgresql-client -y

# Other installs
RUN apt update
RUN apt upgrade --yes
RUN apt install --yes libcurl4-openssl-dev
RUN apt-get install --yes libbz2-dev liblzma-dev

# Expose port 8000
EXPOSE 8000