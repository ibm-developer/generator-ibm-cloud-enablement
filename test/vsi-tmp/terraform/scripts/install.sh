#! /usr/bin/env bash

apt-get update
apt-get install -f
wget -qO- "https://deb.nodesource.com/setup_8.x" | bash -;
apt-get install -y nodejs
