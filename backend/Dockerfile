# We are using node version 16
FROM node:16

# Set the working directory within docker image
WORKDIR /usr/src/app

# Install node dependencies
COPY package.json .
RUN npm install

RUN apt-get update
RUN apt-get install --yes python3 python3-pip r-base
RUN pip3 install --upgrade pip

RUN apt update
RUN apt upgrade --yes
RUN apt install --yes libcurl4-openssl-dev
RUN apt-get install --yes libbz2-dev liblzma-dev

# Install Python dependencies
ADD requirements.txt .
RUN pip install -r requirements.txt

# Install R dependencies
ADD requirements.R .
RUN Rscript requirements.R

# Expose port 8000
EXPOSE 8000