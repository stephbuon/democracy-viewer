# We are using node version 16
FROM node:16

# Set the working directory within docker image
WORKDIR /usr/src/app

# Expose port 8000
EXPOSE 8000

# Install node dependencies
RUN npm install

# Install Python dependencies
FROM python
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install R dependencies
FROM r-base
RUN Rscript r_install_dependencies.R