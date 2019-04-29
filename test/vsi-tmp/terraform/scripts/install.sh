#! /usr/bin/env bash

apt-get update
apt-get install -f
wget -qO- "https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh" | bash -;
source ~/.profile
nvm install 8.16.0
