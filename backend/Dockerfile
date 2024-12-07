FROM python:3.11

# Set the working directory within docker image
WORKDIR /usr/src/app

# Other installs
RUN apt-get update
RUN apt-get install curl -y

# Install node
# get install script and pass it to execute: 
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash
# and install node 
RUN apt-get install nodejs

# Install node dependencies
COPY package.json .
RUN npm install

# Install Python dependencies
ADD requirements.txt .
RUN python3 -m pip install -r requirements.txt

# Expose port 8000
EXPOSE 8000
