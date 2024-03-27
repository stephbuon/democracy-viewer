FROM --platform=linux/amd64 public.ecr.aws/docker/library/python:3.11-buster

# Set the working directory within docker image
WORKDIR /usr/src/app

# Other installs
RUN apt update
RUN apt upgrade --yes
RUN apt install --yes libcurl4-openssl-dev
RUN apt-get install --yes libbz2-dev liblzma-dev
RUN apt-get update
RUN apt-get install curl

# Install node
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
### SQL Server
RUN curl https://packages.microsoft.com/config/debian/12/prod.list | tee /etc/apt/sources.list.d/mssql-release.list
RUN curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg
RUN apt-get update
RUN ACCEPT_EULA=Y apt-get install -y msodbcsql17

# Expose port 8000
EXPOSE 8000