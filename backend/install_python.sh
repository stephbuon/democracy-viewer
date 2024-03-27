sudo apt update
sudo apt install software-properties-common wget
wget https://www.python.org/ftp/python/3.11.1/Python-3.11.1.tar.xz
sudo tar -xf Python-3.11.1.tar.xz
cd Python-3.11.1
sudo ./configure --enable-optimizations
sudo make altinstall