git pull
sudo docker-compose down
sudo docker system prune --all --force
sudo docker-compose up -d
sudo systemctl restart nginx
systemctl status ngnix
sudo docker-compose logs -f