FROM python:3.11

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

# Check Python version
RUN python3 --version && sleep 3

# Install Python dependencies
ADD requirements.txt .
RUN python3 -m pip install -r requirements.txt

# Install SpaCy language models
### Chinese
RUN python3 -m spacy download zh_core_web_lg
### English
RUN python3 -m spacy download en_core_web_lg
### French
RUN python3 -m spacy download fr_core_news_lg
### German
RUN python3 -m spacy download de_core_news_lg
### Greek
RUN python3 -m spacy download el_core_news_lg
### Italian
RUN python3 -m spacy download it_core_news_lg
### Japanese
# RUN python3 -m spacy download ja_core_news_lg
### Portuguese
RUN python3 -m spacy download pt_core_news_lg
### Russian
RUN python3 -m spacy download ru_core_news_lg
### Spanish
RUN python3 -m spacy download es_core_news_lg
# Third party language models
### Latin
RUN python3 -m pip install https://huggingface.co/latincy/la_core_web_lg/resolve/main/la_core_web_lg-any-py3-none-any.whl

# Install SQL clients
### PostgreSQL
RUN apt-get install postgresql-client -y
### SQL Server
# RUN curl https://packages.microsoft.com/config/debian/12/prod.list | tee /etc/apt/sources.list.d/mssql-release.list
# RUN curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg
# RUN apt-get update
# RUN ACCEPT_EULA=Y apt-get install -y msodbcsql17

# Expose port 8000
EXPOSE 8000