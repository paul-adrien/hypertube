# hypertube

//front
cd /front;
sudo apt install -y nodejs;
npm install;
sudo npm install @angular/cli@11.2.10;
ng serve --port 8081

pour enlever l'erreur WDS : ng serve --live-reload=false --port 8081

//Mongodb
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 68818C72E52529D4
sudo echo "deb http://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo mkdir -p /data/db/
sudo chown -R user42:user42 /data/db
sudo mongod

//back
mkdir /tmp/movies
touch /tmp/movies/empty.vtt
cd /node-server;
npm install
sudo n stable
/usr/local/bin/node server.js

//Pour enlever warning firefox VM
sudo apt install firefox
sudo apt upgrade //verifier avant si le instal n'a pas deja up